<script setup lang="ts">
definePageMeta({ layout: 'sidebar' })

const supabase = useSupabaseClient()
const userSession = useSupabaseUser()
const { userName } = await useCurrentUser()

const fb = (val: any, fallbackVal: any = '?') => (val !== null && val !== undefined && val !== '' ? val : fallbackVal)

// 1. Data ophalen volgens database-schema
const { data } = await useAsyncData('dashboard-data', async () => {
  const userId = userSession.value?.sub
  if (!userId) {
    return { verlof: null }
  }

  // Haal verlof op uit verlof_test
  const verlofRes = await supabase
      .from('verlof_test')
      .select('verlof_uren')
      .eq('id', userId)
      .maybeSingle()

  return {
    verlof: verlofRes.data
  }
}, { watch: [userSession] })


// Koppelingen user -> rol via de SQL-functie get_user_roles (user_link + roles + auth.users)
type UserRoleLink = { id: number, user_id: string, user_name: string | null, role_name: string | null }

const userRoleLinks = ref<UserRoleLink[]>([])

async function fetchUserRoleLinks() {
  const { data, error } = await supabase.rpc('get_user_roles')

  if (error) {
    console.error('Koppelingen ophalen mislukt:', error)
    return
  }

  userRoleLinks.value = (data ?? []) as unknown as UserRoleLink[]
}

onMounted(fetchUserRoleLinks)

// 2. Gegevens verwerken
// Verlof data uit verlof_test
const totalBudgetHours = 250 // Standaard jaartotaal
const hoursPerDay = 8 // Standaard werkdag

// Uren omzetten naar werkdagen (afgerond op halve dagen)
const toDays = (hours: number) => Math.round((hours / hoursPerDay) * 2) / 2
const formatDays = (hours: number | null) => hours != null ? `${toDays(hours)} dagen` : '?'

const remainingHours = computed(() => {
  const uren = data.value?.verlof?.verlof_uren
  return uren != null ? Number(uren) : null
})

// Opgenomen uren = budget - resterend
const usedHours = computed(() => {
  if (remainingHours.value != null) {
    return Math.max(0, totalBudgetHours - remainingHours.value)
  }
  return 0
})

// Kleur van de verlofbalk op basis van het resterende percentage
const remainingColor = computed(() => {
  const percentage = ((remainingHours.value ?? 0) / totalBudgetHours) * 100
  if (percentage > 66) return 'success'
  if (percentage >= 33) return 'warning'
  return 'error'
})

// Stat cards bovenin
const stats = computed(() => [
  { value: formatDays(remainingHours.value), label: 'Verlof resterend' },
  { value: formatDays(remainingHours.value != null ? usedHours.value : null), label: 'Verlof opgenomen' },
  { value: '0 dagen', label: 'Ziekgemeld' },
  { value: '0', label: 'Aanvragen lopend' }
])
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold">Hallo {{ userName.split(' ')[0] }}!</h1>
      <p class="text-xs text-neutral-500 mt-0.5">Hier is je actuele verlof-overzicht</p>
    </header>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in stats" :key="stat.label" class="bg-black text-white rounded-2xl border-none">
        <p class="text-2xl font-semibold">{{ stat.value }}</p>
        <p class="text-xs text-neutral-400 mt-1">{{ stat.label }}</p>
      </UCard>
    </div>

    <!-- Bottom Panels -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <!-- Verlofsaldo Card -->
      <UCard class="bg-black text-white rounded-2xl border-none space-y-6">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold">Verlofsaldo overzicht</span>
            <span class="text-xs text-neutral-400">{{ formatDays(totalBudgetHours) }} budget</span>
          </div>
        </template>

        <!-- Gewoon verlof -->
        <div class="space-y-2">
          <div class="flex justify-between text-xs">
            <span>Gewoon verlof</span>
            <span class="text-neutral-400">
              {{ remainingHours != null ? toDays(remainingHours) : '?' }} / {{ toDays(totalBudgetHours) }} dagen
            </span>
          </div>
          <UProgress
              :model-value="remainingHours ?? 0"
              :max="totalBudgetHours"
              :color="remainingColor"
              size="md"
          />
          <p class="text-[11px] text-neutral-400">
            {{ formatDays(remainingHours) }} beschikbaar
          </p>
        </div>

        <!-- Ziekmeldingen -->
        <div class="space-y-2 pt-4 border-t border-neutral-900">
          <div class="flex justify-between text-xs">
            <span>Ziekmeldingen</span>
            <span class="text-neutral-400">0 dagen</span>
          </div>
          <UProgress :model-value="0" :max="40" color="error" size="md" />
        </div>
      </UCard>

      <!-- Recente Aanvragen Card -->
      <UCard class="bg-black text-white rounded-2xl border-none">
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold">Recente aanvragen</span>
            <UButton label="Bekijk alles" variant="link" color="neutral" size="xs" class="text-neutral-400" />
          </div>
        </template>

        <div class="py-10 text-center text-xs text-neutral-500">
          Nog geen verlofaanvragen ingediend.
        </div>
      </UCard>
    </div>

    <!-- Gebruikers en hun rol (user_link -> roles) -->
    <UCard class="bg-black text-white rounded-2xl border-none">
      <template #header>
        <span class="text-sm font-semibold">Gebruikers en rollen</span>
      </template>

      <p v-if="!userRoleLinks.length" class="py-6 text-center text-xs text-neutral-500">
        Geen koppelingen gevonden.
      </p>

      <ul v-else class="divide-y divide-neutral-900">
        <li
            v-for="link in userRoleLinks"
            :key="link.id"
            class="flex justify-between items-center py-3 text-xs"
        >
          <span class="font-mono text-neutral-400">
            {{ fb(link.user_name, link.user_id) }}
          </span>
          <span class="font-semibold">{{ fb(link.role_name) }}</span>
        </li>
      </ul>
    </UCard>
  </div>
</template>
