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

  // Elements
  let nameInput: HTMLInputElement;
  let summaryInput: HTMLInputElement;
  let descriptionTextarea: HTMLTextAreaElement;
  let generateButton: HTMLButtonElement;
  let linkInput: HTMLInputElement;
  let validateLinkButton: HTMLButtonElement;
  let validationMessage: HTMLParagraphElement;
  let submitButton: HTMLButtonElement;

  // State
  let isLinkValid = false;

  // Handle form submission
  async function handleUpdatePlace(event: Event) {
    event.preventDefault();

    if (!isLinkValid) {
      alert("Please validate the Google Maps link before submitting.");
      return;
    }

    const formData = new FormData(form);
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
        console.log(`Place updated: ${response.data?.name}`);
        updateModal?.close();
      } else {
        console.error("Failed to update place:", response.error);
      }
    } catch (error: any) {
      console.error("Unexpected error:", error.message);
    }
  }

  function closeModal() {
    updateModal?.close();
  }

  // AI Description Generation
  async function generateDescription() {
    const title = nameInput.value.trim();
    const summary = summaryInput.value.trim();

    if (!title || !summary) return;

    generateButton.disabled = true;
    generateButton.textContent = "Generating...";

    try {
      const result = await actions.getDescription(title + " " + summary);

      if (result.data) {
        descriptionTextarea.value = result.data.trim();
        descriptionTextarea.dispatchEvent(
          new Event("input", { bubbles: true })
        );
      } else {
        alert(
          "Failed to generate description: " + (result.error || "Unknown error")
        );
      }
    } catch (err) {
      console.error("AI generation error:", err);
      alert("An unexpected error occurred while generating the description.");
    } finally {
      generateButton.disabled = false;
      generateButton.textContent = "AI Generate";
    }
  }

  // Toggle AI button based on inputs
  function toggleGenerateButton() {
    const name = nameInput?.value.trim();
    const summary = summaryInput?.value.trim();
    if (generateButton) {
      generateButton.disabled = !(name && summary);
    }
  }

  let originalLink = place.link;

  // Validate Google Maps Link
  async function validateLink() {
    const link = linkInput.value.trim();
    const googleMapsEmbedRegex =
      /^https:\/\/www\.google\.com\/maps\/d\/embed\?mid=/;

    // Reset message
    validationMessage.classList.add("hidden");
    validationMessage.textContent = "";
    isLinkValid = false;
    submitButton.disabled = true;

    if (!googleMapsEmbedRegex.test(link)) {
      showError("Invalid URL format. Must be a Google My Maps embed link.");
      return;
    }

    validateLinkButton.disabled = true;
    validateLinkButton.textContent = "Validating...";

    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(link)}`;
      const response = await fetch(proxyUrl, { method: "GET", mode: "cors" });

      if (!response.ok) {
        showError("Link returned an error. Check if it’s public.");
        return;
      }

      const text = await response.text();
      if (text.includes("https://www.google.com/maps/d/viewer")) {
        showSuccess("✅ Valid Google My Maps link!");
      } else {
        showError("This doesn't appear to be a valid Google My Maps page.");
      }
    } catch (error) {
      console.error("Link validation error:", error);
      showError("Unable to reach the link. It may be private or invalid.");
    } finally {
      validateLinkButton.disabled = false;
      validateLinkButton.textContent = "Validate";
    }
  }

  function showValidState(msg: string) {
    validationMessage.classList.remove("hidden", "text-red-600");
    validationMessage.classList.add("text-green-600");
    validationMessage.textContent = msg;
    isLinkValid = true;
    submitButton.disabled = false;
  }

  function showError(msg: string) {
    validationMessage.classList.remove("hidden", "text-green-600");
    validationMessage.classList.add("text-red-600");
    validationMessage.textContent = msg;
    isLinkValid = false;
    submitButton.disabled = true;
  }

  function showSuccess(msg: string) {
    showValidState(msg);
  }

  onMount(() => {
    // Initialize autocomplete (existing code)
    autoCompleteJS = new autoComplete({
      /* ... */
    });

    // Set initial state for AI button
    toggleGenerateButton();

    // Set initial link validation state
    isLinkValid = true; // Assume valid if unchanged
    submitButton.disabled = false;

    // Add event listeners
    nameInput?.addEventListener("input", toggleGenerateButton);
    summaryInput?.addEventListener("input", toggleGenerateButton);
    generateButton?.addEventListener("click", generateDescription);
    validateLinkButton?.addEventListener("click", validateLink);

    // Listen to link changes
    linkInput?.addEventListener("input", () => {
      const currentLink = linkInput.value.trim();
      const isModified = currentLink !== originalLink;

      if (!isModified) {
        // If back to original, re-enable submit
        isLinkValid = true;
        showValidState("Original link restored.");
      } else {
        // If modified, require validation
        isLinkValid = false;
        submitButton.disabled = true;
        validationMessage.classList.remove("hidden");
        validationMessage.classList.add("text-red-600");
        validationMessage.textContent = "Link changed. Please validate again.";
      }
    });
  });

  // Cleanup on unmount if needed
  $effect(() => {
    return () => {
      nameInput?.removeEventListener("input", toggleGenerateButton);
      summaryInput?.removeEventListener("input", toggleGenerateButton);
      generateButton?.removeEventListener("click", generateDescription);
      validateLinkButton?.removeEventListener("click", validateLink);
    };
  });
</script>

<dialog
  bind:this={updateModal}
  id={place.id}
  aria-labelledby={place.id + "-title"}
  class="fixed inset-0 left-1/2 top-2 !mt-2 sm:!mt-10 w-screen overflow-visible -translate-x-1/2 translate-y-[5vh] transform rounded-xl opacity-0 shadow-lg backdrop-blur-lg transition-all duration-500 transition-discrete backdrop:bg-black/0 backdrop:backdrop-blur-lg transition:transform backdrop:transition-[overlay,display,opacity,transform] open:block open:translate-y-0 open:opacity-100 open:backdrop:bg-black/20 dark:open:backdrop:bg-neutral-700/20 open:starting:-translate-y-[5vh] open:starting:opacity-0 sm:w-1/2"
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

    <h2
      id={place.id + "-title"}
      class="mt-2 w-full text-center text-xl font-bold sm:text-2xl"
    >
      Edit this map
    </h2>

    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700"
        >Name</label
      >
      <input
        type="text"
        id={"update-name" + id}
        name="name"
        bind:this={nameInput}
        placeholder="Name"
        minlength="3"
        maxlength="40"
        value={place.name}
        required
        class="mt-1 h-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>

    <!-- Summary & Public Toggle -->
    <div class="flex gap-2">
      <div class="w-full">
        <label for="summary" class="block text-sm font-medium text-gray-700"
          >Summary</label
        >
        <input
          type="text"
          id="summary"
          name="summary"
          bind:this={summaryInput}
          placeholder="Summary"
          minlength="3"
          maxlength="33"
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

    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700"
        >Description</label
      >
      <div class="relative">
        <textarea
          id="description"
          name="description"
          bind:this={descriptionTextarea}
          placeholder="Description"
          minlength="100"
          maxlength="130"
          value={place.description}
          required
          class="mt-1 h-[3lh] block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
        <button
          type="button"
          bind:this={generateButton}
          class="absolute right-2 bottom-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          AI Generate
        </button>
      </div>
    </div>

    <!-- Link -->
    <div>
      <label for="link" class="block text-sm font-medium text-gray-700"
        >Link *Needs to be a Google Maps embed link</label
      >
      <div class="relative">
        <input
          type="text"
          id="link"
          name="link"
          bind:this={linkInput}
          placeholder="https://www.google.com/maps/d/embed?mid=..."
          value={place.link}
          required
          class="invalid:border-red-500 mt-1 h-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <button
          type="button"
          bind:this={validateLinkButton}
          class="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-medium px-3 py-1 rounded-md transition"
        >
          Validate
        </button>
      </div>
      <p
        id="update-validation"
        bind:this={validationMessage}
        class="mt-1 h-[1lh] text-xs hidden"
      ></p>
    </div>

    <!-- Tag -->
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

    <!-- Submit -->
    <button
      type="submit"
      bind:this={submitButton}
      class="w-full disabled:opacity-40 disabled:hover:bg-blue-500 disabled:hover:!cursor-not-allowed bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      Update Place
    </button>
  </form>
</dialog>
