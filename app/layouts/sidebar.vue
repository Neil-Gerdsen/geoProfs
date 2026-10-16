<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { userName, userRole, userInitials } = await useCurrentUser()

const navItems: NavigationMenuItem[][] = [
  [
    { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
    { label: 'Verlof aanvragen', icon: 'i-lucide-calendar-plus', to: '/verlof-aanvragen' },
    { label: 'Mijn aanvragen', icon: 'i-lucide-file-text' },
    { label: 'Ziekmelden', icon: 'i-lucide-heart-pulse' },
    { label: 'Aanwezigheid', icon: 'i-lucide-users' }
  ],
  [
    { label: 'Manager', type: 'label' },
    { label: 'Team dashboard', icon: 'i-lucide-layout-grid' },
    { label: 'Team aanvragen', icon: 'i-lucide-inbox' },
    { label: 'Planning', icon: 'i-lucide-calendar-range' },
    { label: 'Notificaties', icon: 'i-lucide-bell' }
  ],
  [
    { label: 'Office manager', type: 'label' },
    { label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
    { label: 'Verlofaanvragen', icon: 'i-lucide-calendar-check' },
    { label: 'Gebruikersbeheer', icon: 'i-lucide-user-cog' },
    { label: 'Manager vervangen', icon: 'i-lucide-user-round-cog' },
    { label: 'Export', icon: 'i-lucide-download' }
  ],
  [
    { label: 'Admin', type: 'label' },
    { label: 'Teams', icon: 'i-lucide-users-round' },
    { label: 'Office managers', icon: 'i-lucide-briefcase' }
  ]
]

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
