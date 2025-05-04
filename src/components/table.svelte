<script lang="ts">
  import UpdateModal from "@components/update-modal.svelte";
  import DeleteModal from "@components/delete-confirmation.svelte";
  import HeroiconsPencil from "src/icons/HeroiconsPencil.svelte";
  import HeroiconsTrash from "src/icons/HeroiconsTrash.svelte";
  import { actions } from "astro:actions";
  import "iconify-icon";
  import { onMount } from "svelte";
  let message = $state("");
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  let totalPages = $state(1);

  let { userId, places } = $props();

  function calculateTotalPages() {
    return Math.ceil(places.length / itemsPerPage);
  }

  function getCurrentPageItems() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return places.slice(startIndex, endIndex);
  }

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage++;
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }

  $effect(() => {
    totalPages = calculateTotalPages();
  });

  async function handleGetPlaces() {
    try {
      const result = await actions.getPlacesForUser();
      places = result.data;
      totalPages = calculateTotalPages();
      currentPage = 1; // Reset to first page
      message = "Places fetched!";
    } catch (error) {
      if (error instanceof Error) {
        message = `Error: ${error.message}`;
      } else {
        message = "An unexpected error occurred";
      }
    }
  }
  async function handleDeletePlace(id: string) {
    let message = $state("");
    try {
      const result = await actions.deletePlace({
        id: id,
      });
      if (result.data && result?.data.success) {
        places = places.filter((place: { id: string }) => place.id !== id);
        message = "Place deleted!";
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

  onMount(() => {
    const dialogs = document.querySelectorAll("dialog");
    dialogs.forEach((dialog) => {
      dialog.addEventListener("close", () => {
        handleGetPlaces();
      });
    });
  });
</script>

<table class="table min-w-full">
  <thead>
    <tr>
      <th scope="col" class="group w-fit">
        <div class="flex items-center justify-between">Name</div>
      </th>
      <th scope="col" class="group w-fit">
        <div class="flex items-center justify-between">Summary</div>
      </th>
      <th scope="col" class="group w-fit">
        <div class="flex items-center justify-between">Description</div>
      </th>
      <th scope="col" class="--exclude-from-ordering">Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each getCurrentPageItems() as place}
      <tr>
        <td>{place.name}</td>
        <td>{place.summary}</td>
        <td class="max-w-96 truncate">{place.description}</td>
        <td>
          <button
            class="btn btn-circle btn-text btn-sm"
            aria-label="Action button"
            onclick={() => (window as any)[`${place.id}`].showModal()}
          >
            <HeroiconsPencil size={1.6}/>
          </button>
          <button
            class="btn btn-circle btn-text btn-sm"
            aria-label="Action button"
            onclick={() => (window as any)[`delete-${place.id}`].showModal()}
          >
          <HeroiconsTrash size={1.5}/>
          </button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<div class="flex justify-center items-center gap-2 mt-4">
  <button
    class="btn btn-sm"
    disabled={currentPage === 1}
    onclick={() => prevPage()}
  >
    Previous
  </button>

  {#each Array(totalPages) as _, i}
    <button
      class="btn btn-sm {currentPage === i + 1 ? 'btn-primary' : ''}"
      onclick={() => goToPage(i + 1)}
    >
      {i + 1}
    </button>
  {/each}

  <button
    class="btn btn-sm"
    disabled={currentPage === totalPages}
    onclick={() => nextPage()}
  >
    Next
  </button>
</div>

<div class="text-center text-sm mt-2">
  Page {currentPage} of {totalPages} ({places.length} items)
</div>

{#each places as place}
  <UpdateModal {place} />
  <DeleteModal name={place.name} id={place.id} onConfirm={handleDeletePlace} />
{/each}
