<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { userName, userRole, userInitials } = await useCurrentUser()

// Welke rol per groep toegang heeft (moet overeenkomen met roles.name in de database)
const navGroups: { navitems: NavigationMenuItem[] }[] = [
  {
    roles: ['Medewerker'],
    items: [
      { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
      { label: 'Verlof aanvragen', icon: 'i-lucide-calendar-plus', to: '/verlof-aanvragen' },
      { label: 'Mijn aanvragen', icon: 'i-lucide-file-text', to: '/mijn-aanvragen' },
      { label: 'Ziekmelden', icon: 'i-lucide-heart-pulse', to: '/ziekmelden' },
      { label: 'Aanwezigheid', icon: 'i-lucide-users', to: '/aanwezigheid' },
    ]
  },
  {
    roles: ['Manager'],
    items: [
      { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
      { label: 'Team dashboard', icon: 'i-lucide-layout-grid', to: '/team-dashboard' },
      { label: 'Verlofaanvragen', icon: 'i-lucide-inbox', to: '/verlof-inbox' },
      { label: 'Planning', icon: 'i-lucide-calendar-range', to: '/planning' },
      { label: 'Notificaties', icon: 'i-lucide-bell', to: '/notificaties' }
    ]
  },
  {
    roles: ['Office Manager'],
    items: [
      { label: 'Office dashboard', icon: 'i-lucide-layout-grid', to: '/office-dashboard'},
      { label: 'Verlofaanvragen', icon: 'i-lucide-inbox', to: '/verlof-overzicht' },
      { label: 'Gebruikersbeheer', icon: 'i-lucide-user-cog', to: '/gebruikersbeheer' },
      { label: 'Manager vervangen', icon: 'i-lucide-user-round-cog', to: '/manager-vervangen' },
      { label: 'Export', icon: 'i-lucide-download', to: '/export' }
    ]
  },
  {
    roles: ['Admin'],
    items: [
      { label: 'Teams', icon: 'i-lucide-users-round', to: '/teams' },
      { label: 'Office managers', icon: 'i-lucide-briefcase', to: '/office-managers' }
    ]
  }
]

// Alleen groepen van de eigen rol tonen
const navItems = computed<NavigationMenuItem[][]>(() =>
    navGroups
        .filter(({ roles }) => roles.includes(userRole.value))
        .map(({ items }) => items)
)

const handleLogout = async () => {
  await navigateTo('/logout')
}
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-black border-r border-neutral-900 flex flex-col justify-between shrink-0 p-4">
      <div class="space-y-6 min-h-0 overflow-y-auto">
        <div class="flex items-center gap-3 px-2">
          <div class="size-8 rounded-xl bg-white text-black font-black grid place-content-center">G</div>
          <span class="font-mono font-bold text-lg">Geoprofs</span>
        </div>

        <!-- User profile -->
        <div class="flex items-center gap-3 p-2 rounded-xl bg-neutral-900 border border-neutral-800">
          <UAvatar :text="userInitials" size="sm" class="bg-neutral-800 text-white font-mono font-medium" />
          <div class="min-w-0 leading-tight">
            <p class="text-xs font-medium truncate">{{ userName }}</p>
            <p class="text-[11px] text-neutral-400 font-mono">{{ userRole }}</p>
          </div>
        </div>

        <UNavigationMenu :items="navItems" orientation="vertical" class="w-full" />
      </div>

      <UButton
          label="Uitloggen"
          icon="i-lucide-log-out"
          variant="ghost"
          color="neutral"
          size="sm"
          class="text-neutral-400 hover:text-red-400"
          @click="handleLogout"
      />
    </aside>

    <!-- Main Content -->
    <main class="flex-1 bg-white text-neutral-900 overflow-y-auto p-8 lg:p-10 space-y-6">
      <slot />
    </main>
  </div>
</template>
