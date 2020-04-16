<template>
  <div class="app-go-back">
    <button @click.prevent="$router.back()" class="app-go-back-button" type="button">
      <arrow-right color="white" class="app-go-back-button-arrow mr-4" /> <slot />
    </button>
  </div>
</template>
<script>
import ArrowRight from './ArrowRight.vue'

export default {
  name: 'GoBack',
  components: {
    ArrowRight
  }
}
</script>
<style scoped>
.app-go-back {
  @apply flex;
  @apply items-center;
  @apply justify-start;
  @apply w-full;
  @apply bg-black;
  @apply pl-6 pr-6;

  height: 58px;
}

.app-go-back-button {
  @apply flex;
  @apply items-center;
  @apply text-white;

  font-size: 16px;
  outline: none;
  background: none;
  border: none;
}

.app-go-back-button-arrow {
  @apply flex;

  transform: rotate(180deg);
}
</style>
