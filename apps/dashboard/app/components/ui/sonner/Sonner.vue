<script setup lang="ts">
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner'

defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    position="top-right"
    :duration="4000"
    rich-colors
    close-button
  />
</template>
