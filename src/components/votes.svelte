<script>
  const { votes } = $props();
</script>

<div class="flex items-center">
  <div class="flex flex-col items-center">
    <!-- Container with fixed height -->
    <div class="relative h-28 w-8 rounded-full overflow-hidden">
      <!-- Fixed full-height gradient background -->
      <div
        class="absolute inset-0 w-full h-full"
        style="background: linear-gradient(to top, #22c55e, #facc15, #ef4444);"
      ></div>
      <!-- Overlay that covers the gradient from top -->
      <div
        class="absolute top-0 w-full bg-gray-200 transition-all duration-300"
        style="height: {100 - votes}%;"
      ></div>
    </div>
    <!-- <p class="mt-2 text-sm font-medium">Votes: {votes}</p> -->
  </div>
</div>
