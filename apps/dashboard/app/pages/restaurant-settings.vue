<template>
  <div>
    <PageHeader title="Restaurant Settings" description="Configure core restaurant preferences including currency formatting." />

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
      <BaseSpinner />
    </div>

    <!-- Access state -->
    <EmptyState v-else-if="!isAdmin" title="Access Restricted" description="Only admins can update restaurant settings.">
      <template #icon>
        <Icon name="lucide:lock" class="h-6 w-6 text-gray-400" />
      </template>
    </EmptyState>

    <!-- Settings form -->
    <div v-else class="rounded-lg bg-white p-6 shadow-sm">
      <form class="space-y-6" @submit.prevent="saveSettings">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">General</h2>
          <p class="text-sm text-gray-500">Basic business information used across the dashboard.</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="restaurantName" class="mb-1 block text-sm font-medium text-gray-700">Restaurant Name</label>
            <input
              id="restaurantName"
              v-model.trim="form.restaurantName"
              type="text"
              required
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="My Restaurant"
            />
          </div>

          <div>
            <label for="defaultLanguage" class="mb-1 block text-sm font-medium text-gray-700">Default Language</label>
            <input
              id="defaultLanguage"
              v-model.trim="form.defaultLanguage"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="en"
            />
          </div>

          <div>
            <label for="timezone" class="mb-1 block text-sm font-medium text-gray-700">Timezone</label>
            <input
              id="timezone"
              v-model.trim="form.timezone"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Europe/Berlin"
            />
          </div>

          <div>
            <label for="phone" class="mb-1 block text-sm font-medium text-gray-700">Contact Phone</label>
            <input
              id="phone"
              v-model.trim="form.phone"
              type="text"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="+49 123 456789"
            />
          </div>
        </div>

        <div>
          <label for="address" class="mb-1 block text-sm font-medium text-gray-700">Address</label>
          <textarea
            id="address"
            v-model.trim="form.address"
            rows="2"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Restaurant address"
          />
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-900">Financial & Regional</h2>
          <p class="text-sm text-gray-500">Control currency display, locale, and billing percentages.</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="currencyCode" class="mb-1 block text-sm font-medium text-gray-700">Currency</label>
            <select
              id="currencyCode"
              v-model="form.currencyCode"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="LKR">LKR - Sri Lankan Rupee</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>

          <div>
            <label for="locale" class="mb-1 block text-sm font-medium text-gray-700">Locale</label>
            <select
              id="locale"
              v-model="form.locale"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="sv-SE">Sweden (sv-SE)</option>
              <option value="de-DE">Germany (de-DE)</option>
              <option value="nl-NL">Netherlands (nl-NL)</option>
            </select>
          </div>

          <div>
            <label for="taxRate" class="mb-1 block text-sm font-medium text-gray-700">Tax Rate (%)</label>
            <input
              id="taxRate"
              v-model.number="form.taxRate"
              min="0"
              max="100"
              step="0.01"
              type="number"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label for="serviceChargeRate" class="mb-1 block text-sm font-medium text-gray-700">Service Charge (%)</label>
            <input
              id="serviceChargeRate"
              v-model.number="form.serviceChargeRate"
              min="0"
              max="100"
              step="0.01"
              type="number"
              class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          Currency Preview: {{ formatPreview(1234.56) }}
        </div>

        <div class="flex items-center justify-between border-t border-gray-100 pt-4">
          <p class="text-xs text-gray-500">Last updated: {{ lastUpdatedLabel }}</p>

          <BaseButton
            type="submit"
            variant="primary"
            :loading="saving"
            :disabled="loading"
          >
            Save Settings
          </BaseButton>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="successMessage" class="text-sm text-green-600">{{ successMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { clientDoc } from '~/services/firebase'

interface RestaurantSettings {
  restaurantName: string
  currencyCode: string
  locale: string
  timezone: string
  defaultLanguage: string
  phone: string
  address: string
  taxRate: number
  serviceChargeRate: number
  updatedAt?: Timestamp
}

const SETTINGS_COLLECTION = 'settings'
const SETTINGS_DOC_ID = 'restaurant'

useHead({
  title: 'Restaurant Settings - Admin Panel',
})

const { firestore } = useFirebase()
const { isAdmin } = useAuth()

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const successMessage = ref('')
const lastUpdated = ref<Date | null>(null)

const ALLOWED_LOCALES = ['sv-SE', 'de-DE', 'nl-NL'] as const
type AllowedLocale = typeof ALLOWED_LOCALES[number]

const normalizeLocale = (value: string | undefined): AllowedLocale => {
  if (!value) {
    return 'de-DE'
  }

  return ALLOWED_LOCALES.includes(value as AllowedLocale)
    ? (value as AllowedLocale)
    : 'de-DE'
}

const form = ref<RestaurantSettings>({
  restaurantName: '',
  currencyCode: 'EUR',
  locale: 'de-DE',
  timezone: 'UTC',
  defaultLanguage: 'en',
  phone: '',
  address: '',
  taxRate: 0,
  serviceChargeRate: 0,
})

const loadSettings = async () => {
  if (!firestore || !isAdmin.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    const settingsRef = clientDoc(SETTINGS_COLLECTION, SETTINGS_DOC_ID)
    const snapshot = await getDoc(settingsRef)

    if (!snapshot.exists()) {
      return
    }

    const data = snapshot.data() as Partial<RestaurantSettings>

    form.value = {
      restaurantName: data.restaurantName || '',
      currencyCode: data.currencyCode || 'EUR',
      locale: normalizeLocale(data.locale),
      timezone: data.timezone || 'UTC',
      defaultLanguage: data.defaultLanguage || 'en',
      phone: data.phone || '',
      address: data.address || '',
      taxRate: Number(data.taxRate || 0),
      serviceChargeRate: Number(data.serviceChargeRate || 0),
    }

    if (data.updatedAt?.toDate) {
      lastUpdated.value = data.updatedAt.toDate()
    }
  } catch (e: any) {
    error.value = e?.message || 'Failed to load restaurant settings'
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  if (!firestore || !isAdmin.value) {
    return
  }

  saving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const payload = {
      ...form.value,
      updatedAt: serverTimestamp(),
    }

    await setDoc(clientDoc(SETTINGS_COLLECTION, SETTINGS_DOC_ID), payload, { merge: true })

    lastUpdated.value = new Date()
    successMessage.value = 'Settings saved successfully.'
  } catch (e: any) {
    error.value = e?.message || 'Failed to save restaurant settings'
  } finally {
    saving.value = false
  }
}

const formatPreview = (value: number) => {
  try {
    return new Intl.NumberFormat(form.value.locale || 'de-DE', {
      style: 'currency',
      currency: form.value.currencyCode || 'EUR',
    }).format(value)
  } catch {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }
}

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) {
    return 'Never'
  }

  return lastUpdated.value.toLocaleString(form.value.locale || 'de-DE')
})

onMounted(() => {
  loadSettings()
})
</script>
