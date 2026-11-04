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
    return { verlof: null, aankomend: [] }
  }

  // Haal verlof op uit verlof_test
  const verlofRes = await supabase
      .from('verlof_test')
      .select('verlof_uren')
      .eq('id', userId)
      .maybeSingle()

  // 3 eerstvolgende aanvragen die nog niet afgelopen zijn (lokale datum, YYYY-MM-DD)
  const vandaag = new Date().toLocaleDateString('sv-SE')
  const aanvragenRes = await supabase
      .from('verlofaanvragen')
      .select('id, start_datum, eind_datum, reden, status, aangevraagd_op')
      .gte('eind_datum', vandaag)
      .order('start_datum', { ascending: true })
      .limit(3)

  return {
    verlof: verlofRes.data,
    aankomend: aanvragenRes.data ?? []
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

const formatDatum = (d: string) =>
  new Date(`${d}T00:00`).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

const formatMoment = (d: string) =>
  new Date(d).toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Verlofsaldo Card (rekt mee tot de hoogte van de aanvragen-kolom) -->
      <section class="flex flex-col gap-3 min-w-0">
      <!-- Onzichtbare kopregel met dezelfde hoogte als 'Aankomende aanvragen', zodat de kaarten gelijk beginnen -->
      <div class="hidden lg:flex justify-between items-center invisible" aria-hidden="true">
        <h2 class="text-sm font-semibold">&nbsp;</h2>
        <UButton label="&nbsp;" variant="link" color="neutral" size="xs" tabindex="-1" />
      </div>

      <UCard
          class="bg-black text-white rounded-2xl border-none flex-1 flex flex-col"
          :ui="{ header: 'px-6 py-3 sm:px-6', body: 'px-6 py-4 sm:px-6 sm:py-4 flex-1 grid grid-rows-2' }"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold">Verlofsaldo overzicht</span>
            <span class="text-xs text-neutral-400">{{ formatDays(totalBudgetHours) }} budget</span>
          </div>
        </template>

        <!-- Gewoon verlof -->
        <div class="flex flex-col justify-center gap-2 pb-3">
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
        <div class="flex flex-col justify-center gap-2 pt-3 border-t border-neutral-900">
          <div class="flex justify-between text-xs">
            <span>Ziekmeldingen</span>
            <span class="text-neutral-400">0 dagen</span>
          </div>
          <UProgress :model-value="0" :max="40" color="error" size="md" />
          <p class="text-[11px] text-neutral-400">
            0 dagen ziekgemeld
          </p>
        </div>
      </UCard>
      </section>

      <!-- Aankomende aanvragen (zelfde layout als Mijn aanvragen) -->
      <section class="space-y-3 min-w-0">
        <div class="flex justify-between items-center">
          <h2 class="text-sm font-semibold">Aankomende aanvragen</h2>
          <UButton label="Bekijk alles" to="/mijn-aanvragen" variant="link" color="neutral" size="xs" class="text-neutral-500" />
        </div>

        <div class="space-y-3">

          <UCard v-for="aanvraag in data?.aankomend ?? []" :key="aanvraag.id" class="bg-black text-white rounded-2xl border-none"
            :ui="{ body: 'px-6 py-4 sm:px-6 sm:py-4' }">
            <div class="grid grid-cols-[2fr_1.5fr_1fr_2fr] gap-4 items-center text-xs">
              <span>
                {{ formatDatum(aanvraag.start_datum) }} t/m {{ formatDatum(aanvraag.eind_datum) }}
              </span>
              <span class="truncate" :title="aanvraag.reden">{{ aanvraag.reden }}</span>
              <span>{{ aanvraag.status }}</span>
              <span>{{ formatMoment(aanvraag.aangevraagd_op) }}</span>
            </div>
          </UCard>

          <UCard v-if="!data?.aankomend?.length" class="bg-black text-white rounded-2xl border-none">
            <p class="py-6 text-center text-xs text-neutral-500">
              Geen aankomende verlofaanvragen.
            </p>
          </UCard>
        </div>
      </section>
    </div>
  </div>
</template>
