import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
  const { data: orders, error: ordersFetchError } = await supabase
    .from('order')
    .select(
      `
      *,
      pizza_size (*),
      order_topping (quantity, topping (name))
    `,
    )
    .order('created_at', { ascending: false })

  if (ordersFetchError) {
    error(500, ordersFetchError.message)
  }

  for (const order of orders) {
    const orderId = order.id
    const { data: mostRecentOrderStatus, error: orderHistoryFetchError } = await supabase
      .from('order_history')
      .select(
        `
        order_status (name),
        created_at,
        notes
        `
      )
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (orderHistoryFetchError) {
      error(500, orderHistoryFetchError.message)
    }

    order.status = {
      // @ts-ignore
      name: mostRecentOrderStatus.order_status.name,
      created_at: mostRecentOrderStatus.created_at,
      notes: mostRecentOrderStatus.notes
    }
  }

  return { orders, thank: url.searchParams.has('thanks') }
}
