<script setup lang="ts">
definePageMeta({ layout: 'sidebar' })

const supabase = useSupabaseClient()

const toast = useToast()

const toonBehandelde = ref(false)

const { data: aanvragen, refresh } = await useAsyncData('verlofaanvragen', async () => {
  const { data, error } = await supabase
    .from('verlofaanvragen')
    .select('id, start_datum, eind_datum, reden, status, aangevraagd_op')
    .order('aangevraagd_op', { ascending: false })
  if (error) throw error
  return data
})

const columns = [
  { id: 'periode', header: 'periode' },
  { accessorKey: 'reden', header: 'Reden' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aangevraagd_op', header: 'Aangevraagd op' },
  { id: 'acties', header: '' }
]

async function verwijder(id: number) {
  if (!confirm('Weet je zeker dat je deze aanvraag wilt verwijderen?')) return

  const { data, error } = await supabase
    .from('verlofaanvragen')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    toast.add({ title: 'Verwijderen mislukt', description: error.message, color: 'error' })
    return
  }

  if (!data?.length) {
    toast.add({ title: 'Verwijderen niet toegestaan', description: 'Alleen open aanvragen kunnen worden verwijderd.', color: 'error' })
    return
  }

  toast.add({ title: 'Aanvraag verwijderd', color: 'success' })
  await refresh()
}

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

const gefilterd = computed(() =>
  (aanvragen.value ?? []).filter(a => toonBehandelde.value ? a.status !== 'aangevraagd' : a.status === 'aangevraagd'
  )
)
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Mijn aanvragen</h1>
        <p class="text-xs text-neutral-500 mt-0.5">Hier zie je al je ingediende verlofaanvragen</p>
      </div>

      <UButton :label="toonBehandelde ? 'behandeld' : 'in behandeling'" icon="i-lucide-arrow-left-right" trailing
        color="neutral" size="lg" class="bg-black text-white hover:bg-neutral-800 rounded-2xl px-6 py-3 text-xs"
        @click="toonBehandelde = !toonBehandelde" />
    </header>

    <div class="overflow-x-auto">
      <div class="min-w-[900px] space-y-3">
        <!-- Kolomkoppen -->
        <div class="grid grid-cols-[2fr_1.5fr_1fr_2fr_1fr] gap-4 px-6 text-xs font-semibold text-black">
          <span>Periode:</span>
          <span>Beschrijving:</span>
          <span>Status:</span>
          <span>Aangevraagd op:</span>
          <span />
        </div>

        <UCard v-for="aanvraag in gefilterd" :key="aanvraag.id" class="bg-black text-white rounded-2xl border-none"
          :ui="{ body: 'px-6 py-4 sm:px-6 sm:py-4' }">
          <div class="grid grid-cols-[2fr_1.5fr_1fr_2fr_1fr] gap-4 items-center text-xs">
            <span>
              {{ formatDatum(aanvraag.start_datum) }} t/m {{ formatDatum(aanvraag.eind_datum) }}
            </span>
            <span class="truncate" :title="aanvraag.reden">{{ aanvraag.reden }}</span>
            <span>{{ aanvraag.status }}</span>
            <span>{{ formatMoment(aanvraag.aangevraagd_op) }}</span>

            <div class="text-right">
              <UButton v-if="aanvraag.status === 'aangevraagd'" label="verwijderen" color="error" variant="link"
                size="xs" class="p-0" @click="verwijder(aanvraag.id)" />
            </div>
          </div>
        </UCard>

        <UCard v-if="!gefilterd.length" class="bg-black text-white rounded-2xl border-none">
          <p class="py-6 text-center text-xs text-neutral-500">
            {{ toonBehandelde ? 'Nog geen behandelde aanvragen.' : 'Geen aanvragen in behandeling.' }}
          </p>
        </UCard>
      </div>
    </div>
  </div>
</template>