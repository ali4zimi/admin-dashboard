export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for auth pages
  if (to.path === '/login' || to.path === '/register') {
    return
  }

  const { user, initAuth, loading } = useAuth()

  // Initialize auth if not already done
  if (loading.value) {
    await initAuth()
  }

  // Redirect to login if not authenticated
  if (!user.value) {
    return navigateTo('/login')
  }
})
