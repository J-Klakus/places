<script lang="ts" module>
  export interface OpenmojiMinusProps {
    size?: number;
    class?: string;
  }
</script>

<script lang="ts">
  const { size = 0.7, class: className = '' }: OpenmojiMinusProps = $props();
</script>

<svg
   xmlns="http://www.w3.org/2000/svg"
   width="{size}em"
   height="{size}em"
   viewBox="0 0 72 72"
   class="{className}">
  <path fill="#d0cfce" d="M59 41H13V31h46"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M13 31h46v10H13z"/>
</svg>