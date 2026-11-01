<script setup lang="ts">
definePageMeta({ layout: 'sidebar' })

const supabase = useSupabaseClient()

const toast = useToast()

const {data: aanvragen, refresh} = await useAsyncData('verlofaanvragen', async () => {
  const {data, error} = await supabase
    .from('verlofaanvragen')
    .select('id, start_datum, eind_datum, reden, status, aangevraagd_op')
    .order('aangevraagd_op', { ascending: false })
  if (error) throw error
  return data
})

const columns = [
  { id: 'periode', header: 'periode'},
  { accessorKey: 'reden', header: 'Reden' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'aangevraagd_op', header: 'Aangevraagd op' },
  { id: 'acties', header: ''}
]

async function verwijder(id: number) {
  if (!confirm('Weet je zeker dat je deze aanvraag wilt verwijderen?')) return

  const {data, error} = await supabase
    .from('verlofaanvragen')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    toast.add({ title:'Verwijderen mislukt', description: error.message, color: 'error' })
    return
  }

  if (!data?.length) {
    toast.add({ title:'Verwijderen niet toegestaan', description: 'Alleen open aanvragen kunnen worden verwijderd.', color: 'error' })
    return
  }

  toast.add({ title:'Aanvraag verwijderd', color: 'success' })
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
</script>

<template>
  <header>
    <h1 class="text-2xl font-bold">Mijn aanvragen</h1>
  </header>

  <UTable :data="aanvragen ?? []" :columns="columns" class="mt-8">
    <template #periode-cell="{row}">
      {{ formatDatum(row.original.start_datum) }} t/m {{ formatDatum(row.original.eind_datum) }}
    </template>

    <template #aangevraagd_op-cell="{row}">
      {{ formatMoment(row.original.aangevraagd_op) }}
    </template>

    <template #acties-cell="{row}">
      <UButton
        v-if="row.original.status === 'aangevraagd'"
        label="Verwijderen"
        color="error"
        variant="ghost"
        size="xs"
        @click="verwijder(row.original.id)"
      />
    </template>
  </UTable>
</template>