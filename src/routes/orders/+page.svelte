<script lang="ts">
  import Panel from '$lib/components/Panel.svelte'
  import { XMarkSolid20 } from '@withpluto/heroicons-svelte'
  import type { PageData } from './$types'

  export let data: PageData
  let showThanks = data.thank

  function calculateTotal(order: (typeof data.orders)[number]) {
    const totalToppings = order.order_topping.reduce(
      (acc, topping) => acc + topping.quantity,
      0,
    )
    return (
      order.pizza_size!.price +
      Math.max(0, totalToppings - order.pizza_size!.num_included_toppings) *
        order.pizza_size!.price_per_additional_topping
    )
  }
</script>

<div class="flex w-full flex-col items-center gap-6">
  {#if showThanks}
    <Panel
      class="flex w-full flex-row items-center justify-between gap-4 bg-blue-400 p-4 text-white"
    >
      <p>Thank you for your order!</p>
      <button on:click={() => (showThanks = false)}><XMarkSolid20 /></button>
    </Panel>
  {/if}

  <h1 class="text-2xl font-bold">Orders</h1>

  <div class="flex w-full flex-col items-center gap-4">
    {#each data.orders as order}
      {@const price = calculateTotal(order)}
      <Panel class="flex w-full flex-col gap-4 p-6">
        <h2 class="text-xl font-bold">
          {new Date(order.created_at).toLocaleDateString()}
        </h2>
        <div class="flex flex-row items-start justify-between gap-4">
          <div class="flex flex-col gap-2">
            <p class="text-lg font-bold">
              {order.pizza_size?.size} pizza
              {#if order.order_topping.length > 0}
                with:
              {/if}
            </p>
            {#if order.order_topping.length > 0}
              <p class="text-sm">
                Toppings: {order.order_topping
                  .map((topping) => `${topping.topping?.name} x${topping.quantity}`)
                  .join(', ')}
              </p>
            {/if}
            {#if order.special_notes}
              <div class="flex flex-col gap-2">
                <h2 class="text-xl font-bold">Special notes</h2>
                <p class="text-sm">
                  {order.special_notes}
                </p>
              </div>
            {/if}
          </div>

          <div class="flex flex-col">
            <h2 class="text-xl font-bold">Total</h2>
            <p class="text-2xl font-bold">
              £{price.toFixed(2)}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <h2 class="text-xl font-bold">Status</h2>
            <p class="text-sm">
              {order.status.name}
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <h2 class="text-xl font-bold">Last update</h2>
            <p class="text-sm">
              {new Date(order.status.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </Panel>
    {/each}
  </div>
</div>
