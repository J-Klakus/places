<script>
  import { onMount } from "svelte";
  const { place, handleVote } = $props();

  let iframe = null;
  let placeholder = null;
  let link = null;

  onMount(() => {
    const loadIframe = () => {
      placeholder.classList.add("opacity-0");
      link.classList.remove("hidden");
    };

    iframe.addEventListener("load", loadIframe);
  });
</script>

<li class="list-none card h-96">
  <div class="relative h-48 overflow-hidden group">
    <div
      bind:this={placeholder}
      class="h-full absolute pointer-events-none grid place-items-center font-bold text-gray-500 z-[999] text-lg inset-0 w-full bg-gray-200 transition-opacity duration-300 ease-in-out"
    >
      <span class="animate-pulse">Loading...</span>
    </div>
    <div class="overflow-hidden h-60 relative group">
      <iframe
        bind:this={iframe}
        loading="eager"
        frameborder="0"
        height="100%"
        width="550px"
        class="-mt-[75px] -ml-[50px] pointer-events-none"
        title={place.name}
        src={place.link}
      ></iframe>
      <a
        target="_blank"
        bind:this={link}
        href={place.link}
        class="hidden absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
      >
        <div
          class="relative group/button hover:cursor-pointer bg-black rounded-sm h-6 w-6"
        >
          <iconify-icon
            class="text-white p-0.5 ml-[1px]"
            icon="cuida:open-in-new-tab-outline"
            height={18}
          ></iconify-icon>
          <span
            class="tooltip-content top-4 left-0 group-hover/button:opacity-100 group-hover/button:visible"
            role="tooltip"
          >
            <span class="tooltip-body text-xs !rounded-tl-none"
              >Open in a new link</span
            >
          </span>
        </div>
      </a>
    </div>
  </div>
  <div class="card-body !p-4 pt-2 !flex !flex-row !justify-between">
    <div>
      <p class="card-title text-lg mt-0 mb-1 line-clamp-2 h-[1lh]">
        {place.name}: {place.summary}
      </p>
      <p class="line-clamp-3 h-[3lh] !mt-4">
        {place.description}
      </p>
      <div class="flex justify-between w-full items-center">
        {#if place.tag === "food"}
          <div class="relative group -mt-5 pt-0.5">
            <iconify-icon icon="openmoji:fork-and-knife-with-plate" height={40}
            ></iconify-icon>
            <span
              class="tooltip-content -top-6 left-0 group-hover:opacity-100 group-hover:visible"
              role="tooltip"
            >
              <span class="tooltip-body !rounded-bl-none">Food</span>
            </span>
          </div>
        {:else if place.tag === "accommodation"}
          <div class="relative group -mt-5 pt-0.5">
            <iconify-icon class="flex-shrink-0" icon="openmoij:bed" height={40}
            ></iconify-icon>
            <span
              class="tooltip-content -top-6 left-0 group-hover:opacity-100 group-hover:visible"
              role="tooltip"
            >
              <span class="tooltip-body !rounded-bl-none">Accomodation</span>
            </span>
          </div>
        {:else if place.tag === "cafes-with-wifi"}
          <div class="relative group -mt-5 pt-0.5">
            <iconify-icon class="flex-shrink-0" icon="openmoij:wifi" height={40}
            ></iconify-icon>
            <span
              class="tooltip-content -top-6 left-0 group-hover:opacity-100 group-hover:visible"
              role="tooltip"
            >
              <span class="tooltip-body !rounded-bl-none">Cafe With Wifi</span>
            </span>
          </div>
        {:else if place.tag === "attractions"}
          <div class="relative group -mt-5 pt-0.5">
            <iconify-icon icon="openmoji:camera-with-flash" height={40}
            ></iconify-icon>
            <span
              class="tooltip-content -top-6 left-0 group-hover:opacity-100 group-hover:visible"
              role="tooltip"
            >
              <span class="tooltip-body !rounded-bl-none">Attractions</span>
            </span>
          </div>
        {:else if place.tag === "mixed"}
          <div class="relative group -mt-5 pt-0.5">
            <iconify-icon icon="openmoji:openstreetmap" height={40}
            ></iconify-icon>
            <span
              class="tooltip-content -top-6 left-0 group-hover:opacity-100 group-hover:visible"
              role="tooltip"
            >
              <span class="tooltip-body !rounded-bl-none">Mixed</span>
            </span>
          </div>
        {/if}
        <div class="flex items-end gap-1 h-fit">
          <button
            class="btn btn-outline btn-primary p-0 h-8 w-8 grid place-items-center shrink-0"
            aria-label="vote"
            onclick={() => handleVote(place.id, false)}
          >
            <iconify-icon
              icon="heroicons:minus-16-solid"
              class="-ml-1 -mt-0.5"
              height={20}
            ></iconify-icon>
          </button>
          <div class="flex flex-col">
            <p class="text-center text-lg h-8 w-8 pt-1.5 !my-0">
              {place.votes}
            </p>
          </div>
          <button
            class="btn btn-outline btn-primary p-0 h-8 w-8 grid place-items-center shrink-0"
            aria-label="vote"
            onclick={() => handleVote(place.id, true)}
          >
            <iconify-icon
              icon="heroicons:plus-16-solid"
              class="-ml-1 -mt-0.5"
              height={20}
            ></iconify-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</li>
