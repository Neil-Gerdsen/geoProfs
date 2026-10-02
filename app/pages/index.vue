<template>
  <div class="p-8 space-y-6">
    <h2 class="bg-amber-200 text-xl font-bold p-2 rounded">
      hoi
    </h2>

    <UCard
      variant="subtle"
      class="max-w-md mx-auto border border-gray-200 dark:border-gray-700 shadow-md rounded-xl overflow-hidden"
      :ui="{
        header: 'bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700',
        body: 'px-4 py-5',
        footer: 'bg-gray-100 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700'
      }"
    >
      <template #header>
        <h3 class="font-semibold text-lg">
          Kaart titel
        </h3>
      </template>

      <div v-if="loading" class="text-gray-500">
        Items laden...
      </div>
      <p v-else-if="error" role="alert" class="text-red-600">
        Items laden mislukt: {{ error }}
      </p>
      <p v-else-if="test.length === 0" class="text-gray-500">
        Geen items gevonden. De tabel is leeg of Row Level Security filtert de rijen.
      </p>
      <div v-else v-for="item in test" :key="item.id" class="bg-blue-300">
        {{ item.name ?? 'Naam ontbreekt op deze rij' }}
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">
            Laatst bijgewerkt: vandaag
          </span>

          <UButton size="sm" color="primary">
            Bekijk meer
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
<script setup lang="js">
const supabase = useSupabaseClient()

const test = ref([])
const loading = ref(true)
const error = ref('')

async function fetchTest() {
  loading.value = true
  error.value = ''

  try {
    const { data, error: queryError } = await supabase
      .from('test')
      .select('*')

    if (queryError) {
      throw new Error(queryError.message)
    }

    test.value = data ?? []
  } catch (cause) {
    console.error('Items laden mislukt:', cause)
    error.value = cause instanceof Error ? cause.message : 'Onbekende fout'
  } finally {
    loading.value = false
  }
}

onMounted(fetchTest)
</script>