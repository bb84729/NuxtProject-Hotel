
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup>
useHead({
  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js',
      
      crossorigin: 'anonymous',
    },
  ],
})
</script>
<style lang="scss">
@import '@/assets/styles/all.scss'
</style>