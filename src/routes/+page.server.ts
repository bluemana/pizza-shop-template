import { error, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { orderFormSchema } from '$lib/forms'

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const [
    form,
    { data: pizzaSizes, error: pizzaSizesFetchError },
    { data: toppings, error: toppingsFetchError },
  ] = await Promise.all([
    superValidate(zod(orderFormSchema)),
    supabase.from('pizza_size').select('*'),
    supabase.from('topping').select('*'),
  ])

  if (pizzaSizesFetchError || toppingsFetchError) {
    error(500, 'Error fetching data')
  }

  return { form, pizzaSizes, toppings }
}

export const actions: Actions = {
  default: async ({ request, locals: { supabase, supabaseAdmin, user } }) => {
    const form = await superValidate(request, zod(orderFormSchema))
    if (!user) {
      return setError(form, 'You must be logged in to place an order')
    }
    if (!form.valid) {
      return fail(400, { form })
    }

    const { data: order, error: orderCreateError } = await supabase
      .from('order')
      .insert({
        user_id: user.id,
        size_id: form.data.size_id,
        special_notes: form.data.special_notes,
      })
      .select()
      .single()

    if (orderCreateError) {
      console.error('Error creating order', orderCreateError)
      return setError(form, orderCreateError.message)
    }

    const { error: orderToppingsCreateError } = await supabase
      .from('order_topping')
      .insert(
        form.data.topping_ids.map((topping_id, index) => ({
          order_id: order.id,
          topping_id,
          quantity: form.data.topping_quantities[index],
        })),
      )

    if (orderToppingsCreateError) {
      console.error('Error creating order toppings', orderToppingsCreateError)
      await supabaseAdmin.from('order').delete().eq('id', order.id)
      return setError(form, orderToppingsCreateError.message)
    }

    const { error: orderHistoryCreateError } = await supabase
      .from('order_history')
      .insert(
        {
          order_id: order.id,
          order_status_id: 1
        },
      )

    if (orderHistoryCreateError) {
      console.error('Error creating order history', orderHistoryCreateError)
      await supabaseAdmin.from('order').delete().eq('id', order.id)
      return setError(form, orderHistoryCreateError.message)
    }

    redirect(303, `/orders?thanks=1`)
  },
}
