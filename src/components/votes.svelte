<script>
  const { votes } = $props();
</script>

<div class="flex h-fit items-center">
  <div class="flex flex-col items-center">
    <div class="relative h-37 w-8 rounded-t-xl overflow-hidden">
      <div
        class="absolute inset-0 w-full h-full"
        style="background: linear-gradient(to top, #22c55e, #facc15, #ef4444);"
      ></div>
      <div
        class="absolute top-0 w-full bg-gray-200 transition-all duration-300"
        style="height: {100 - votes}%;"
      ></div>
    </div>
  </div>
</div>
