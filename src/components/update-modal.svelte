<script lang="ts">
  import { actions } from "astro:actions";
  import { onMount } from "svelte";
  import autoComplete from "@tarekraafat/autocomplete.js";
  import HeroiconsXMark16Solid from "src/icons/HeroiconsXMark16Solid.svelte";
  // Props
  let { place } = $props();

  let updateModal: HTMLDialogElement | null = null;
  let form: HTMLFormElement;
  let autoCompleteJS: any | null = null;
  const id = place.id;

  async function handleUpdatePlace(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    try {
      const response = await actions.updatePlace({
        id: id as string,
        name: formData.get("name") as string,
        summary: formData.get("summary") as string,
        isPublic: Boolean(formData.get("isPublic")),
        description: formData.get("description") as string,
        link: formData.get("link") as string,
        tag: formData.get("tag") as
          | "food"
          | "accommodation"
          | "cafes-with-wifi"
          | "attractions"
          | "mixed",
      });

      if (!response.error) {
        const placeName = response.data?.name || "";
        console.log(`Place updated: ${placeName}`);
        updateModal?.close();
      } else {
        const errorMessage = response.error || "Failed to create place.";
        console.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred";
      console.error(errorMessage);
    }
  }

  function closeModal() {
    if (updateModal) {
      updateModal.close();
    }
  }

  onMount(() => {
    autoCompleteJS = new autoComplete({
      selector: "#update-name" + id,
      placeHolder: "Search for Places...",
      data: {
        src: async (query: string) => {
          try {
            const { data, error } = await actions.getCity(query);
            return data;
          } catch (error) {
            return error;
          }
        },
      },
      resultItem: {
        highlight: true,
      },
      events: {
        input: {
          selection: (event: { detail: { selection: { value: string } } }) => {
            const selection = event.detail.selection.value;
            autoCompleteJS.input.value = selection;
          },
        },
      },
    });
  });
</script>

<dialog
  bind:this={updateModal}
  id={place.id}
  class="fixed inset-0 left-1/2 top-2 !mt-10 w-screen overflow-visible -translate-x-1/2 translate-y-[5vh] transform rounded-xl opacity-0 shadow-lg backdrop-blur-lg transition-all duration-500 transition-discrete backdrop:bg-black/0 backdrop:backdrop-blur-lg transition:transform backdrop:transition-[overlay,display,opacity,transform] open:block open:translate-y-0 open:opacity-100 open:backdrop:bg-black/20 dark:open:backdrop:bg-neutral-700/20 open:starting:-translate-y-[5vh] open:starting:opacity-0 sm:w-1/2"
>
  <form bind:this={form} onsubmit={handleUpdatePlace} class="space-y-4 p-4">
    <button
      type="button"
      class="z-50 float-right pr-4 text-neutral-400 hover:opacity-90 focus:outline-none"
      onclick={closeModal}
      aria-label="close"
    >
      <HeroiconsXMark16Solid size={3} class="flex-shrink-0" />
    </button>
    <h2 class="mt-2 w-full text-center text-xl font-bold sm:text-2xl">
      Edit this map
    </h2>
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700"
        >Name</label
      >
      <input
        type="text"
        id={"update-name" + id}
        name="name"
        placeholder="Name"
        minlength={3}
        maxlength={12}
        value={place.name}
        required
        class="mt-1 h-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
    <div class="flex gap-2">
      <div class="w-full">
        <label for="name" class="block text-sm font-medium text-gray-700"
          >Summary</label
        >
        <input
          type="text"
          id="summary"
          name="summary"
          placeholder="Summary"
          minlength={3}
          maxlength={33}
          value={place.summary}
          required
          class="mt-1 h-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <div class="flex flex-col items-center gap-1">
          <label
            class="label-text block text-sm font-medium text-gray-700"
            for="isPublic">Public</label
          >
          <input
            type="checkbox"
            class="checkbox"
            name="isPublic"
            id="isPublic"
            checked={place.isPublic}
          />
        </div>
      </div>
    </div>
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700"
        >Description</label
      >
      <textarea
        id="description"
        name="description"
        placeholder="Description"
        value={place.description}
        minlength={100}
        maxlength={130}
        required
        class="mt-1 h-[3lh] block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      ></textarea>
    </div>
    <div>
      <label for="link" class="block text-sm font-medium text-gray-700"
        >Link *Needs to be a google embed link</label
      >
      <input
        type="text"
        id="link"
        name="link"
        placeholder="https://www.google.com/maps/d/embed?mid=1yq6eTymPh_KJsqCAV1T_MM6_kdQ&ehbc=2E312F"
        value={place.link}
        required
        pattern="^https:\/\/www\.google\.com\/maps\/d\/embed\?mid=.+"
        title="Please enter a valid Google Maps embed link"
        class="mt-1 h-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
    <div>
      <label for="tag" class="block text-sm font-medium text-gray-700"
        >Tag</label
      >
      <select
        id="tag"
        name="tag"
        value={place.tag}
        class="mt-1 h-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="food">Food</option>
        <option value="accommodation">Accommodation</option>
        <option value="cafes-with-wifi">Cafes with Wifi</option>
        <option value="attractions">Attractions</option>
        <option value="mixed">Mixed</option>
      </select>
    </div>
    <button
      type="submit"
      class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >Update Place</button
    >
  </form>
</dialog>
