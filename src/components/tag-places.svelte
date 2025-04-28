<script>
  import { actions } from "astro:actions";
  import { onMount } from "svelte";
  import "iconify-icon";
  import PlaceCard from "./place-card.svelte";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  const options = {
    duration: 4000, // duration of progress bar tween to the `next` value
    initial: 1, // initial progress bar value
    next: 0, // next progress value
    pausable: false, // pause progress bar tween on mouse hover
    dismissable: true, // allow dismiss with close button
    reversed: false, // insert new toast to bottom of stack
    intro: { x: 256 }, // toast intro fly animation settings
    theme: {}, // css var overrides
    classes: [], // user-defined classes
  };
  import { toast } from "@zerodevx/svelte-toast";

  let { places, tag } = $props();

  let message = $state("");

  async function handleGetPlacesByTag() {
    try {
      const result = await actions.getPlacesByTag();
      places = result.data;
      message = "Places fetched!";
    } catch (error) {
      if (error instanceof Error) {
        message = `Error: ${error.message}`;
      } else {
        message = "An unexpected error occurred";
      }
    }
  }

  async function handleVote(id, isLike) {
    try {
      const result = await actions.Vote({
        placeId: id,
        isLike,
      });
      if (result.data) {
        places = places.map((place) => {
          if (place.id === id) {
            const updatedVote = place.votes + (isLike ? 1 : -1);
            return { ...place, votes: updatedVote };
          }
          return place;
        });
        const placeName = places.find((place) => place.id === id)?.name || id;
        message = `Vote ${isLike ? "like" : "dislike"} recorded for ${placeName}!`;
      } else {
        message = "Failed to record vote.";
      }
    } catch (error) {
      if (error instanceof Error) {
        message = `Error: ${error.message}`;
      } else {
        message = "An unexpected error occurred";
      }
    }
  }

  $effect(() => {
    if (message !== "") {
      toast.push(message);
    }
  });

  onMount(() => {
    const dialog = document.getElementById("createMap");
    if (dialog) {
      dialog.addEventListener("close", () => {
        handleGetPlacesByTag();
      });
    }
  });
</script>

<div>
  {#if places.length > 0}
    <ul
      class="mt-2 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 !p-0 min-h-screen"
    >
      {#each places as place}
        <PlaceCard {place} {handleVote} />
      {/each}
    </ul>
  {/if}
  {#if places.length === 0}
    <p class=" text-gray-600">No places found for this tag.</p>
  {/if}
</div>
<SvelteToast {options} />
