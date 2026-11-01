<script setup lang="ts">
definePageMeta({ layout: 'sidebar' })

const supabase = useSupabaseClient()
const toast = useToast()
const state = reactive({
  start_datum: '',
  eind_datum: '',
  reden: ''
})

async function opslaan() {
  const {error} = await supabase.from('verlofaanvragen').insert({ //api fetch voor maken
    start_datum: state.start_datum,
    eind_datum: state.eind_datum,
    reden: state.reden
  })

  if (error) {
    toast.add({ title:'Opslaan mislukt', description: error.message, color: 'error' })
    return
  }

  toast.add({ title:'Verlof aangevraagd', color: 'success' })
  state.start_datum = ''
  state.eind_datum = ''
  state.reden = ''
}
  
</script>

<template>
  <header>
    <h1 class="text-2xl font-bold">Verlof aanvragen</h1>
  </header>

  <UForm :state="state" class="space-y-4 mt-6" @submit="opslaan">
    <UFormField label="Startdatum" name="start_datum" required>
      <UInput v-model="state.start_datum" type="date" />
    </UFormField>

    <UFormField label="Einddatum" name="eind_datum" required>
      <UInput v-model="state.eind_datum" type="date" />
    </UFormField>

    <UFormField label="Reden" name="reden" required>
      <UTextarea v-model="state.reden" />
    </UFormField>

    <UButton type="submit" color="primary">Opslaan</UButton>
  </UForm>
</template>
