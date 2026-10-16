<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md">

      <div class="text-center mb-8">
        <UIcon
          name="i-heroicons-lock-closed"
          class="mx-auto mb-4 h-12 w-12 text-green-600"
        />

        <h1 class="text-3xl font-bold">
          Welkom terug
        </h1>

        <p class="mt-2 text-gray-500">
          Verzuim portaal geoprofs
        </p>
      </div>

      <UCard>
        <form class="space-y-5" @submit.prevent="login">

          <UAlert
            v-if="error"
            color="red"
            title="Inloggen mislukt"
            :description="error"
          />

          <div>
            <label
              for="email"
              class="mb-2 block text-sm font-medium text-gray-900"
              >
              E-Mail
            </label>
            <UInput
              id="email"
              v-model="email"
             type="email"
              placeholder="naam@voorbeeld.nl"
              icon="i-heroicons-envelope"
              class="w-full"
              required
            />
          </div>

          <div>
            <label
              for="password"
              class="mb-2 block text-sm font-medium text-gray-900"
            >
            Wachtwoord
            </label>

            <UInput
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              icon="i-heroicons-lock-closed"
              class="w-full"
              required
            />
          </div>

          <div class="text-right">
            <NuxtLink to="/wachtwoord-vergeten" class="text-sm text-green-600">
              Wachtwoord vergeten?
            </NuxtLink>
          </div>

          <UButton
            type="submit"
            block
            color="green"
            :loading="loading"
          >
            Inloggen
          </UButton>

        </form>
      </UCard>

      <p class="mt-6 text-center text-sm text-gray-500">
        Nog geen account?
        <NuxtLink to="/registreren" class="text-green-600">
          Account aanmaken
        </NuxtLink>
      </p>

    </div>
  </div>
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
    await navigateTo('/dashboard')
  } catch (err: any) {
    error.value =
      err?.data?.statusMessage ||
      'Ongeldige inloggegevens'
  } finally {
    loading.value = false
  }
}
</script>