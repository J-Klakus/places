<script>
  import CuidaOpenInNewTabOutline from "src/icons/CuidaOpenInNewTabOutline.svelte";
  import OpenmojiBed from "src/icons/OpenmojiBed.svelte";
  import OpenmojiForkAndKnifeWithPlate from "src/icons/OpenmojiForkAndKnifeWithPlate.svelte";
  import OpenmojiMinus from "src/icons/OpenmojiMinus.svelte";
  import OpenmojiOpenstreetmap from "src/icons/OpenmojiOpenstreetmap.svelte";
  import OpenmojiPlus from "src/icons/OpenmojiPlus.svelte";
  import OpenmojiWifi from "src/icons/OpenmojiWifi.svelte";
  const { place, handleVote, imageBaseUrl } = $props();

  let image = null;
  let placeholder = null;
  let link = null;
  let imageUrl = imageBaseUrl + place.image;

  const loadImage = () => {
    placeholder.classList.add("opacity-0");
    link.classList.remove("hidden");
  };
</script>

<li class="list-none card h-96">
  <div class="relative h-48 overflow-hidden group">
    <div
      bind:this={placeholder}
      class="h-full absolute pointer-events-none grid place-items-center font-bold text-gray-500 z-[999] text-lg inset-0 w-full bg-gray-200 transition-opacity duration-300 ease-in-out"
    >
      <span class="animate-pulse">Loading...</span>
    </div>
    <div class="overflow-hidden h-96 relative group">
      <!-- <iframe
        bind:this={iframe}
        loading="eager"
        frameborder="0"
        height="100%"
        width="550px"
        class="-mt-[75px] -ml-[50px] pointer-events-none"
        title={place.name}
        src={place.link}
      ></iframe> -->
      <img
        bind:this={image}
        alt={place.name}
        src={imageUrl}
        onload={loadImage}
        class="object-cover w-full h-auto !my-0"
      />
      <a
        target="_blank"
        bind:this={link}
        href={place.link}
        class="absolute top-1 left-1 sm:opacity-0 group-hover:opacity-100 transition-opacity h-13 w-13 duration-300 ease-in-out"
      >
        <div
          class="relative group/button hover:cursor-pointer bg-black/80 rounded-sm h-7 w-7"
        >
          <CuidaOpenInNewTabOutline class="text-white p-1 h-7 w-auto" />
          <span
            class="tooltip-content top-9 sm:top-5 left-0 group-hover/button:opacity-100 group-hover/button:visible"
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
  <div class="card-body w-full !p-4 pt-2 !flex !flex-row !justify-between">
    <div>
      <p class="card-title text-lg mt-0 mb-1 line-clamp-2 h-[1lh]">
        {place.name}
      </p>
      <p class="card-title text-base text-gray-600 mt-2 mb-0 h-[1lh]">
        {place.summary}
      </p>
      <p class="line-clamp-3 h-[3lh] !mt-3">
        {place.description}
      </p>
      <div class="flex justify-between w-full items-center">
        {#if place.tag === "food"}
          <div class="relative group">
            <OpenmojiForkAndKnifeWithPlate class="flex-shrink-0" size={2.4} />
            <span
              class="tooltip-content -top-6 left-0 group-hover:opacity-100 group-hover:visible"
              role="tooltip"
            >
              <span class="tooltip-body !rounded-bl-none">Food</span>
            </span>
          </div>
        {:else if place.tag === "accommodation"}
          <div class="relative group">
            <OpenmojiBed class="flex-shrink-0" size={2.4} />
            <span
              class="tooltip-content -top-6 left-0 group-hover:opacity-100 group-hover:visible"
              role="tooltip"
            >
              <span class="tooltip-body !rounded-bl-none">Accomodation</span>
            </span>
          </div>
        {:else if place.tag === "cafes-with-wifi"}
          <div class="relative group">
            <OpenmojiWifi class="flex-shrink-0" size={2.4} />
            <span
              class="tooltip-content -top-6 left-0 group-hover:opacity-100 group-hover:visible"
              role="tooltip"
            >
              <span class="tooltip-body !rounded-bl-none">Cafe With Wifi</span>
            </span>
          </div>
        {:else if place.tag === "attractions"}
          <div class="relative group">
            <OpenmojiCameraWithFlash class="flex-shrink-0" size={2.4} />
            <span
              class="tooltip-content -top-6 left-0 group-hover:opacity-100 group-hover:visible"
              role="tooltip"
            >
              <span class="tooltip-body !rounded-bl-none">Attractions</span>
            </span>
          </div>
        {:else if place.tag === "mixed"}
          <div class="relative group">
            <OpenmojiOpenstreetmap class="flex-shrink-0" size={2.4} />
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
            class="btn btn-outline border-neutral-500 shadow-xs hover:bg-gray-500/30 shadow-gray-500/80 btn-primary p-0 h-8 w-8 grid place-items-center shrink-0"
            aria-label="vote"
            onclick={() => handleVote(place.id, false)}
          >
            <OpenmojiMinus size={1.2} />
          </button>
          <div class="flex flex-col">
            <p class="text-center text-lg h-8 w-8 pt-1 !my-0">
              {place.votes}
            </p>
          </div>
          <button
            class="btn btn-outline border-neutral-500 shadow-xs hover:bg-gray-500/30 shadow-gray-500/80 btn-primary p-0 h-8 w-8 grid place-items-center shrink-0"
            aria-label="vote"
            onclick={() => handleVote(place.id, true)}
          >
            <OpenmojiPlus size={1.2} />
          </button>
        </div>
      </div>
    </div>
  </div>
</li>
