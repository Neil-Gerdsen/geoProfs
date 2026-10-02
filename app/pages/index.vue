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

      <div class="bg-red-500 w-2xs h-[full]" v-for="item in test" :key="item.id">
        {{ item.name }}
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

async function fetchTest() {
  const result = await supabase
    .from('test')
    .select('*')

  console.log('RESULT:', result)

  test.value = result.data || []
}

onMounted(fetchTest)
</script>