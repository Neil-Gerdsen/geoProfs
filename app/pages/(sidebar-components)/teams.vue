<script setup lang="ts">
definePageMeta({ layout: 'sidebar' })

const teams = [
  { naam: 'Team 1', afdeling: 'Ontwikkeling', manager: 'John Doe', leden: 5, aangemaakt: '15-1-2026' },
  { naam: 'Team 2', afdeling: 'Hr', manager: 'John Doe', leden: 8, aangemaakt: '15-1-2026' },
  { naam: 'Team 3', afdeling: 'Testen', manager: 'John Doe', leden: 3, aangemaakt: '15-1-2026' },
  { naam: 'Team 4', afdeling: 'Marketing', manager: 'John Doe', leden: 15, aangemaakt: '15-1-2026' }
]
</script>

<template>
  <header>
    <h1 class="text-2xl font-bold">Goedemorgen Niek</h1>
    <p class="text-xs text-neutral-500 mt-0.5">Teams:</p>
  </header>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <UCard v-for="team in teams" :key="team.naam" class="bg-black text-white rounded-2xl border-none" :ui="{ body: 'p-6 sm:p-8' }">
      <div class="flex justify-between items-start mb-4">
        <div>
          <p>{{ team.naam }}</p>
          <p class="text-[10px] text-neutral-400">{{ team.afdeling }}</p>
        </div>
        <UButton icon="i-lucide-trash-2" variant="ghost" color="neutral" size="xs" class="text-white" />
      </div>
      <div class="flex flex-col gap-2 text-sm">
        <div class="flex justify-between"><span>Manager</span><span>{{ team.manager }}</span></div>
        <div class="flex justify-between"><span>Leden</span><span>{{ team.leden }}</span></div>
        <div class="flex justify-between"><span>Aangemaakt</span><span>{{ team.aangemaakt }}</span></div>
      </div>
    </UCard>
  </div>
</template>
