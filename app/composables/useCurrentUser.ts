const fb = (val: any, fallbackVal: any = '?') => (val !== null && val !== undefined && val !== '' ? val : fallbackVal)

// Gedeelde gebruikersinfo voor de sidebar-layout en pagina's
export async function useCurrentUser() {
  const supabase = useSupabaseClient()
  const userSession = useSupabaseUser()

  // Haal de rol op via de koppeltabel user_link -> roles
  const { data: role } = await useAsyncData('current-user-role', async () => {
    const userId = userSession.value?.sub
    if (!userId) return null

    const { data } = await supabase
        .from('user_link')
        .select('roles(name)')
        .eq('user_id', userId)
        .maybeSingle()

    return (data?.roles as any)?.name ?? null
  }, { watch: [userSession] })

  // Naam komt uit de Supabase auth metadata (of default naar John Doe als mock)
  const userName = computed<string>(() => {
    return fb(
        userSession.value?.user_metadata?.full_name ||
        userSession.value?.user_metadata?.name ||
        userSession.value?.email?.split('@')[0],
        'John Doe'
    )
  })

  const userRole = computed(() => fb(role.value, 'Medewerker'))

  // Initialen
  const userInitials = computed(() => {
    const parts = userName.value.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?'
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  })

  return { userName, userRole, userInitials }
}
