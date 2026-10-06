<script setup lang="ts">
const error = ref('')
const isLoggingOut = ref(true)

const logout = async () => {
  error.value = ''
  isLoggingOut.value = true

  try {
    await $fetch('/api/logout', { method: 'POST' })
    await navigateTo('/login', { replace: true })
  } catch {
    error.value = 'Uitloggen is niet gelukt. Probeer het opnieuw.'
  } finally {
    isLoggingOut.value = false
  }
}

onMounted(logout)
</script>

<template>
  <main class="grid min-h-screen place-content-center gap-4 bg-black p-6 text-center text-white">
    <p v-if="isLoggingOut">Je wordt uitgelogd...</p>
    <template v-else-if="error">
      <p role="alert">{{ error }}</p>
      <UButton class="mx-auto" @click="logout">
        Opnieuw proberen
      </UButton>
    </template>
  </main>
</template>
