<script lang="ts">
  let { id, onConfirm, name } = $props();
  let deleteModal: HTMLDialogElement | null = null;

  function handleConfirm() {
    onConfirm(id);
    deleteModal!.close();
  }

  function handleCancel() {
    deleteModal!.close();
  }

  function closeModal() {
    if (deleteModal) {
      deleteModal.close();
    }
  }
  function handleClickOutside(event: Event) {
    if (deleteModal && event.target === deleteModal) {
      closeModal();
    }
  }
</script>

<dialog
  id={`delete-${id}`}
  onclick={handleClickOutside}
  bind:this={deleteModal}
  class="fixed inset-0 left-1/2 top-2 !mt-10 w-screen max-w-md overflow-visible -translate-x-1/2 translate-y-[5vh] transform rounded-xl opacity-0 shadow-lg backdrop-blur-lg transition-all duration-500 transition-discrete backdrop:bg-black/0 backdrop:backdrop-blur-lg transition:transform backdrop:transition-[overlay,display,opacity,transform] open:block open:translate-y-0 open:opacity-100 open:backdrop:bg-black/20 dark:open:backdrop:bg-neutral-700/20 open:starting:-translate-y-[5vh] open:starting:opacity-0 sm:w-1/2"
>
  <div class="p-4 space-y-4">
    <h3 class="font-bold text-lg">Confirm Delete</h3>
    <p>Are you sure you want to delete this item?</p>
    <p class="bg-base-300/50 w-fit p-1 rounded-md">{name}</p>
    <div class="modal-action">
      <button class="btn btn-error" onclick={handleConfirm}>Yes</button>
      <button class="btn" onclick={handleCancel}>No</button>
    </div>
  </div>
</dialog>
