<script lang="ts" module>
  export interface OpenmojiPlusProps {
    size?: number;
    class?: string;
  }
</script>

<script lang="ts">
  const { size = 0.7, class: className = '' }: OpenmojiPlusProps = $props();
</script>

<svg
   xmlns="http://www.w3.org/2000/svg"
   width="{size}em"
   height="{size}em"
   viewBox="0 0 72 72"
   class="{className}">
  <path fill="#D0CFCE" d="M31 31V13h10v18h18v10H41v18H31V41H13V31z"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M31 31V13h10v18h18v10H41v18H31V41H13V31z"/>
</svg>