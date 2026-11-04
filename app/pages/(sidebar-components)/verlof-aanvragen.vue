<script setup lang="ts">
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

definePageMeta({ layout: 'sidebar' })

const supabase = useSupabaseClient()
const toast = useToast()

const start = shallowRef<CalendarDate | null>(null)
const eind = shallowRef<CalendarDate | null>(null)

watch(start, (nieuw) => {
  if (nieuw && eind.value && eind.value.compare(nieuw) < 0) {
    eind.value = null
  }
})

const state = reactive({
  reden: ''
})

const vandaag = today(getLocalTimeZone())

function validate(s: typeof state) {
  const errors: { name: string, message: string }[] = []

  if (!start.value) errors.push({ name: 'start_datum', message: 'Kies een startdatum' })
  if (!eind.value) errors.push({ name: 'eind_datum', message: 'Kies een einddatum' })
  if (start.value && eind.value && eind.value.compare(start.value) < 0) {
    errors.push({ name: 'eind_datum', message: 'De einddatum kan niet voor de startdatum liggen' })
  }
  if (start.value && start.value.compare(vandaag) < 0) {
    errors.push({ name: 'start_datum', message: 'De startdatum kan niet in het verleden liggen' })
  }
  if (!s.reden.trim()) errors.push({ name: 'reden', message: 'Geef een reden op' })

  return errors
}

async function opslaan() {
  if (!start.value || !eind.value) return

  const { error } = await supabase.from('verlofaanvragen').insert({
    start_datum: start.value.toString(),
    eind_datum: eind.value.toString(),
    reden: state.reden.trim()
  })

  if (error) {
    toast.add({ title: 'Opslaan mislukt', description: error.message, color: 'error' })
    return
  }

  toast.add({ title: 'Verlof aangevraagd', color: 'success' })
  start.value = null
  eind.value = null
  state.reden = ''
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold">Verlof aanvragen</h1>
      <p class="text-xs text-neutral-500 mt-0.5">Kies de periode en geef een reden op</p>
    </header>

    <UForm :state="state" :validate="validate" class="space-y-6" @submit="opslaan">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField label="Verlof vanaf:" name="start_datum" required
          :ui="{ label: 'text-xs font-semibold text-black' }">
          <UCard class="bg-black text-white rounded-2xl border-none">
            <div class="flex justify-center">
              <UCalendar v-model="start" :min-value="vandaag" color="success" />
            </div>
          </UCard>
        </UFormField>

        <UFormField label="Verlof tot:" name="eind_datum" required :ui="{ label: 'text-xs font-semibold text-black' }">
          <UCard class="bg-black text-white rounded-2xl border-none">
            <div class="flex justify-center">
              <UCalendar v-model="eind" :min-value="start ?? vandaag" color="success" />
            </div>
          </UCard>
        </UFormField>
      </div>

      <UFormField label="Reden:" name="reden" required :ui="{ label: 'text-xs font-semibold text-black' }">
        <UTextarea v-model="state.reden" :rows="8" class="w-full" placeholder="Geef een reden op voor je verlofaanvraag"
          :ui="{ base: 'bg-black !text-white rounded-2xl border-none placeholder:text-neutral-500' }" />
      </UFormField>

      <div class="flex justify-end">
        <UButton type="submit" color="success" size="xl" class="rounded-2xl px-10">
          Opslaan
        </UButton>
      </div>
    </UForm>
  </div>
</template>