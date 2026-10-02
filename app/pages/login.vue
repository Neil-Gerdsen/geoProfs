<template>
    <form @submit.prevent="login">
        <input id="email" v-model="email" type="email" placeholder="email" required />
        <input id="password" v-model="password" type="password" placeholder="password" required />
        <p v-if="error" role="alert">{{ error }}</p>
        <UButton type="submit" :loading="loading" :disabled="loading">
            inloggen

        </UButton>
    </form>


</template>
<script setup lang="ts">
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const login = async () => {
  error.value = ''
  loading.value = true

  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    // Alleen hier komen als de login succesvol was
    await navigateTo('/')
  } catch (err: any) {
    error.value =
      err?.data?.statusMessage ||
      'Ongeldige inloggegevens'
  } finally {
    loading.value = false
  }
}
</script>