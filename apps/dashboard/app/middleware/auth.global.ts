export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client side
  if (import.meta.server) {
    return
  }

  const { user, currentUserProfile, initAuth, loading, logout } = useAuth()

  // Initialize auth if not already done
  if (loading.value) {
    await initAuth()
  }

  // Skip middleware for auth pages (but redirect if already logged in)
  if (to.path === '/login' || to.path === '/register') {
    if (user.value) {
      return navigateTo('/')
    }
    return
  }

  // Redirect to login if not authenticated
  if (!user.value) {
    return navigateTo('/login')
  }

  // Active users only
  if (currentUserProfile.value && currentUserProfile.value.status !== 'active') {
    await logout()
    return navigateTo('/login')
  }
})
