import * as ClientService from '~/services/client.service'
import type { ClientData } from '@restaurant-platform/types'

export const useClient = () => {
  const client = useState<ClientData | null>('current-client', () => null)
  const clientLoading = useState<boolean>('current-client-loading', () => false)
  const clientError = useState<string | null>('current-client-error', () => null)

  const isActive = computed(() => client.value?.status === 'active')
  const isSuspended = computed(() => client.value?.status === 'suspended')
  const restaurantName = computed(() => client.value?.name || '')
  const logoUrl = computed(() => client.value?.logoUrl || '')
  const contactEmail = computed(() => client.value?.contactEmail || '')

  const loadClient = async (forceRefresh = false): Promise<ClientData | null> => {
    if (!forceRefresh && client.value) {
      return client.value
    }

    clientLoading.value = true
    clientError.value = null

    try {
      const data = await ClientService.fetchClient()
      client.value = data
      return data
    } catch (e: any) {
      clientError.value = e?.message || 'Failed to load client'
      client.value = null
      return null
    } finally {
      clientLoading.value = false
    }
  }

  const clearClient = () => {
    client.value = null
    clientError.value = null
  }

  return {
    client,
    loading: clientLoading,
    error: clientError,
    isActive,
    isSuspended,
    restaurantName,
    logoUrl,
    contactEmail,
    loadClient,
    clearClient,
  }
}
