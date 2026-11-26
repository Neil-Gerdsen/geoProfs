<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({ layout: 'sidebar' })

const supabase = useSupabaseClient()
const userSession = useSupabaseUser()
const { userName } = await useCurrentUser()

function getInitials(naam: string) {
  const parts = naam.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?'
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

const stats = computed(() => [
  { value: '2', label: 'Verlofaanvragen' },
  { value: '1', label: 'Manager(s) met verlof vandaag' },
  { value: '1', label: 'Manager(s) ziek vandaag' },
  { value: '2', label: 'Teams zonder manager vandaag' }
])

interface Manager {
  email: string
  username?: string
  userInitials?: string
}

const loading = ref(false)
const errorMessage = ref('')
const managers = ref<Manager[]>([])

async function fetchUsers() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<any[]>('/api/user/all')

    managers.value = response.map(manager => ({
      email: manager.email,
      username: manager.user_metadata?.display_name || '',
      userInitials: getInitials(manager.user_metadata?.display_name || manager.email)
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
    <p class="text-xs text-neutral-500 mt-0.5">Hier is je actuele manager overzicht</p>
  </header>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <UCard v-for="stat in stats" :key="stat.label" class="bg-black text-white rounded-2xl border-none" :ui="{ body: 'p-6 sm:p-8' }">
      <p class="text-2xl font-semibold">{{ stat.value }}</p>
      <p class="text-xs text-neutral-400 mt-1">{{ stat.label }}</p>
    </UCard>
  </div>

  <UCard class="bg-black text-white rounded-2xl border-none" :ui="{ body: 'p-6 sm:p-8' }">
    <p class="text-2xl font-bold mb-4">Teamaanwezigheid week {{ weekNummer }}</p>
    <div class="flex flex-col gap-4">
      <UCard v-for="user in users" :key="user.email">
        <div class="flex items-center gap-3">
          <UAvatar :text="user.userInitials" size="sm" class="bg-neutral-800 text-white font-mono font-medium" />
          <p>{{ user.username || user.email }}</p>
        </div>
      </UCard>
    </div>
  </UCard>
</template>

