<script>
  import Votes from "./votes.svelte";
  const { place, handleVote } = $props();
</script>

<li class="list-none card h-114">
  <iframe class="min-h-52" title={place.name} src={place.link}></iframe>
  <div class="card-body !flex !flex-row !justify-between">
    <div>
      <p class="card-title text-xl mb-2.5 line-clamp-2 h-[2lh]">{place.name}</p>
      <p class="mb-2.5 line-clamp-2 h-[2lh]">{place.description}</p>
      {#if place.tag === "food"}
        <iconify-icon class="flex-shrink-0" icon="heroicons:cake" height={24}
        ></iconify-icon>
      {:else if place.tag === "accommodation"}
        <iconify-icon
          class="flex-shrink-0"
          icon="heroicons:building-office-2"
          height={24}
        ></iconify-icon>
      {:else if place.tag === "cafes-with-wifi"}
        <iconify-icon
          class="flex-shrink-0"
          icon="heroicons:wifi-20-solid"
          height={24}
        ></iconify-icon>
      {:else if place.tag === "attractions"}
        <iconify-icon
          class="flex-shrink-0"
          icon="heroicons:map-pin-16-solid"
          height={24}
        ></iconify-icon>
      {:else if place.tag === "mixed"}
        <iconify-icon
          class="flex-shrink-0"
          icon="heroicons:puzzle-piece-20-solid"
          height={24}
        ></iconify-icon>
      {/if}
    </div>
    <div class="flex items-end gap-1">
      <button aria-label="vote" onclick={() => handleVote(place.id, true)}>
        <iconify-icon
          class="flex-shrink-0"
          icon="heroicons:chevron-up"
          height={14}
        ></iconify-icon>
      </button>
      <div class="flex flex-col">
        <Votes votes={place.votes} />
        <p class="text-center !my-0">{place.votes}</p>
      </div>
      <button aria-label="vote" onclick={() => handleVote(place.id, false)}>
        <iconify-icon
          class="flex-shrink-0"
          icon="heroicons:chevron-down"
          height={14}
        ></iconify-icon>
      </button>
    </div>
  </div>
</li>
