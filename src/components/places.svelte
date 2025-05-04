<script>
  import { actions } from "astro:actions";
  import { onMount } from "svelte";
  import "iconify-icon";
  import PlaceCard from "./place-card.svelte";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { toast } from "@zerodevx/svelte-toast";

  const options = {
    duration: 4000,
    initial: 1,
    next: 0,
    dismissable: true,
    intro: { x: 256 },
  };

  let { places, userId, fetchPlaces, tag = undefined } = $props();
  let showOnlyUserPlaces = $state(false);
  let filteredPlaces = $state(places);
  let message = $state("");

  $effect(() => {
    getFilteredPlaces();
  });

  $effect(() => {
    if (message) toast.push(message);
  });

  onMount(() => {
    const dialog = document.getElementById("createMap");
    if (dialog) {
      dialog.addEventListener("close", handleGetPlaces);
    }
  });

  function getFilteredPlaces() {
    if (document.startViewTransition !== undefined) {
      document.startViewTransition(
        () =>
          (filteredPlaces =
            showOnlyUserPlaces && userId
              ? places.filter((place) => place.userId === userId)
              : places)
      );
    } else {
      filteredPlaces =
        showOnlyUserPlaces && userId
          ? places.filter((place) => place.userId === userId)
          : places;
    }
  }

  async function handleGetPlaces() {
    try {
      const result = tag
        ? await actions.getPlacesByTag(tag)
        : await actions.getTopPlaces();
      places = result.data;
      getFilteredPlaces();
      message = "Places fetched!";
    } catch (error) {
      message =
        error instanceof Error
          ? `Error: ${error.message}`
          : "An unexpected error occurred";
    }
  }

  async function handleVote(id, isLike) {
    try {
      const result = await actions.Vote({
        placeId: id,
        isLike,
      });

      if (result.error) {
        throw new Error(result.error.message || "API returned an error");
      }

      if (result.data) {
        const updatedPlaces = places.map((place) =>
          place.id === id
            ? { ...place, votes: place.votes + (isLike ? 1 : -1) }
            : place
        );

        const place = places.find((place) => place.id === id);
        const placeName = place?.name || `Place #${id}`;

        places = updatedPlaces;
        getFilteredPlaces();
        message = `${isLike ? "👍" : "👎"} Vote recorded for ${placeName}!`;
        return { success: true, message, updatedPlaces };
      } else {
        message = "No data returned. Failed to record vote.";
        return { success: false, message };
      }
    } catch (error) {
      let errorMessage;
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      } else if (typeof error === "string") {
        errorMessage = `Error: ${error}`;
      } else {
        errorMessage =
          "An unexpected error occurred while processing your vote";
      }

      message = errorMessage;
      return { success: false, message, error };
    }
  }
</script>

<div>
  {#if places.length > 0}
    <div class="mb-3 flex justify-end">
      <div
        class="border-base-content/20 flex gap-0.5 rounded-field border p-0.5"
      >
        <button
          class="btn btn-sm {!showOnlyUserPlaces ? 'btn-active' : 'btn-text'}"
          onclick={() => {
            showOnlyUserPlaces = false;
            getFilteredPlaces();
          }}
        >
          All
        </button>
        <button
          class="btn btn-sm {showOnlyUserPlaces ? 'btn-active' : 'btn-text'}"
          onclick={() => {
            showOnlyUserPlaces = true;
            getFilteredPlaces();
          }}
        >
          Mine
        </button>
      </div>
    </div>

    <ul
      class="mt-2 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 !p-0 min-h-screen"
    >
      {#each filteredPlaces as place (place.id)}
        <PlaceCard {place} {handleVote} />
      {/each}
    </ul>
  {/if}
</div>

<SvelteToast {options} />

<style>
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.5s;
  }

  ::view-transition-old(root) {
    animation-name: fade-out;
  }

  ::view-transition-new(root) {
    animation-name: fade-in;
  }

  @keyframes fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
