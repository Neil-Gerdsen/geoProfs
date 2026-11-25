<script setup lang="ts">
import { ref, computed } from 'vue'

const datum = ref(new Date())

const weekNummer = computed(() => {
  const d = new Date(Date.UTC(datum.value.getFullYear(), datum.value.getMonth(), datum.value.getDate()))
  const dagNummer = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dagNummer)
  const jaarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - jaarStart) / 86400000) + 1) / 7)
})

definePageMeta({ layout: 'sidebar' })

const supabase = useSupabaseClient()
const userSession = useSupabaseUser()
const { userName } = await useCurrentUser()

const stats = computed(() => [
  { value: '4', label: 'Openstaande vragen' },
  { value: '2', label: 'Teamleden met verlof vandaag' },
  { value: '8', label: 'Teamleden' },
  { value: '1', label: 'Ziek vandaag' }
])

interface User {
  email: string
  username?: string
}

const loading = ref(false)
const errorMessage = ref('')
const users = ref<User[]>([])

async function fetchUsers() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<any[]>('/api/user/all')

    users.value = response.map(user => ({
      email: user.email,
      username: user.user_metadata?.display_name || ''
    }))
  } catch (error) {
    console.error('Fout bij ophalen gebruikers:', error)
    errorMessage.value = 'Gebruikers konden niet worden opgehaald.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

</script>

<template>
  <header>
    <h1 class="text-2xl font-bold">Hallo {{ userName.split(' ')[0] }}!</h1>
    <p class="text-xs text-neutral-500 mt-0.5">Hier is je actuele team overzicht</p>
  </header>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <UCard v-for="stat in stats" :key="stat.label" class="bg-black text-white rounded-2xl border-none" :ui="{ body: 'p-6 sm:p-8' }">
      <p class="text-2xl font-semibold">{{ stat.value }}</p>
      <p class="text-xs text-neutral-400 mt-1">{{ stat.label }}</p>
    </UCard>
  </div>

  <UCard class="bg-black text-white rounded-2xl border-none" :ui="{ body: 'p-6 sm:p-8' }">
    <p class="text-2xl font-bold">Teamaanwezigheid week {{weekNummer}}</p>
    <UCard v-for="user in users" :key="user.email">
      <p>{{ user.username || user.email }}</p>
    </UCard>
  </UCard>
</template>

