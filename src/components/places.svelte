<script>
  import { actions } from "astro:actions";
  import { onMount } from "svelte";

  let places = $state([]);
  let newPlaceName = $state("");
  let newPlaceLink = $state("");
  let newPlaceTag = $state("");
  let updatePlaceId = $state("");
  let updatePlaceName = $state("");
  let updatePlaceLink = $state("");
  let updatePlaceTag = $state("");
  let deletePlaceId = $state("");
  let votePlaceId = $state("");
  let message = $state("");

  async function handleCreatePlace() {
    try {
      const result = await actions.createPlace({
        name: newPlaceName,
        link: newPlaceLink,
        tag: newPlaceTag,
      });
      if (result) {
        message = `Place created: ${result.data.name}`;
        newPlaceName = "";
        newPlaceLink = "";
      } else {
        message = "Failed to create place.";
      }
    } catch (error) {
      if (error instanceof Error) {
        message = `Error: ${error.message}`;
      } else {
        message = "An unexpected error occurred";
      }
    }
  }

  async function handleGetPlaces() {
    try {
      const result = await actions.getPlaces();
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

  async function handleUpdatePlace() {
    try {
      const result = await actions.updatePlace({
        id: updatePlaceId,
        name: updatePlaceName,
        link: updatePlaceLink,
        tag: updatePlaceTag,
      });
      if (result) {
        message = `Place updated: ${result.data.name}`;
        updatePlaceId = "";
        updatePlaceName = "";
        updatePlaceLink = "";
      } else {
        message = "Failed to update place (check ID and permissions).";
      }
    } catch (error) {
      if (error instanceof Error) {
        message = `Error: ${error.message}`;
      } else {
        message = "An unexpected error occurred";
      }
    }
  }

  async function handleDeletePlace() {
    try {
      const result = await actions.deletePlace({
        id: deletePlaceId,
      });
      if (result?.data.success) {
        message = "Place deleted!";
        deletePlaceId = "";
      } else {
        message = "Failed to delete place (check ID and permissions).";
      }
    } catch (error) {
      if (error instanceof Error) {
        message = `Error: ${error.message}`;
      } else {
        message = "An unexpected error occurred";
      }
    }
  }

  async function handleVote(isLike) {
    try {
      const result = await actions.Vote({
        placeId: votePlaceId,
        isLike,
      });
      if (result) {
        message = `Vote ${isLike ? "incremented" : "decremented"} for place ${result.name}!`;
        votePlaceId = "";
      } else {
        message = "Failed to increment vote.";
      }
    } catch (error) {
      if (error instanceof Error) {
        message = `Error: ${error.message}`;
      } else {
        message = "An unexpected error occurred";
      }
    }
  }

  onMount(() => {
    handleGetPlaces();
  });
</script>

<div>
  <h1 class="text-2xl font-bold mb-4">Server Actions Test</h1>

  <!-- <div class="mb-4">
    <h2 class="text-lg font-semibold mb-2">Create Place</h2>
    <input
      type="text"
      placeholder="Name"
      bind:value={newPlaceName}
      class="border p-2 mr-2"
    />
    <input
      type="text"
      placeholder="Link"
      bind:value={newPlaceLink}
      class="border p-2 mr-2"
    />
    <select bind:value={newPlaceTag} class="border p-2.5 mr-2">
      <option value="food">Food</option>
      <option value="accommodation">Accommodation</option>
      <option value="cafes-with-wifi">Cafes with Wifi</option>
      <option value="attractions">Attractions</option>
      <option value="mixed">Mixed</option>
    </select>
    <button
      onclick={handleCreatePlace}
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >Create Place</button
    >
  </div> -->

  <div class="mb-4">
    <h2 class="text-lg font-semibold mb-2">Get Places</h2>
    <button
      onclick={handleGetPlaces}
      class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >Get Places</button
    >
    {#if places.length > 0}
      <ul
        class="mt-2 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 !p-0"
      >
        {#each places as place}
          <li class="list-none card">
            <iframe class="min-h-52" title={place.name} src={place.link}
            ></iframe>
            <div class="card-body">
              <p class="card-title mb-2.5">{place.name}</p>
              Votes: {place.votes}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="mb-4">
    <h2 class="text-lg font-semibold mb-2">Update Place</h2>
    <input
      type="text"
      placeholder="Place ID"
      bind:value={updatePlaceId}
      class="border p-2 mr-2"
    />
    <input
      type="text"
      placeholder="New Name"
      bind:value={updatePlaceName}
      class="border p-2 mr-2"
    />
    <input
      type="text"
      placeholder="New Link"
      bind:value={updatePlaceLink}
      class="border p-2 mr-2"
    />
    <select bind:value={updatePlaceTag} class="border p-2.5 mr-2">
      <option value="food">Food</option>
      <option value="accommodation">Accommodation</option>
      <option value="cafes-with-wifi">Cafes with Wifi</option>
      <option value="attractions">Attractions</option>
      <option value="mixed">Mixed</option>
    </select>
    <button
      onclick={handleUpdatePlace}
      class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
      >Update Place</button
    >
  </div>

  <div class="mb-4">
    <h2 class="text-lg font-semibold mb-2">Delete Place</h2>
    <input
      type="text"
      placeholder="Place ID"
      bind:value={deletePlaceId}
      class="border p-2 mr-2"
    />
    <button
      onclick={handleDeletePlace}
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >Delete Place</button
    >
  </div>

  <div class="mb-4">
    <h2 class="text-lg font-semibold mb-2">Increment/Decrement Vote</h2>
    <input
      type="text"
      placeholder="Place ID"
      bind:value={votePlaceId}
      class="border p-2 mr-2"
    />
    <button
      onclick={() => handleVote(true)}
      class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded mr-2"
      >Like</button
    >
    <button
      onclick={() => handleVote(false)}
      class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >Dislike</button
    >
  </div>
  {#if message}
    <p class="mt-4 text-red-500">{message}</p>
  {/if}
</div>
