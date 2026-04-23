import { doc, getDoc } from 'firebase/firestore'

interface RestaurantSettingsData {
  currencyCode?: string
  locale?: string
}

const SETTINGS_COLLECTION = 'settings'
const SETTINGS_DOC_ID = 'restaurant'
const ALLOWED_LOCALES = ['sv-SE', 'de-DE', 'nl-NL'] as const

type AllowedLocale = typeof ALLOWED_LOCALES[number]

const normalizeLocale = (value?: string): AllowedLocale => {
  if (!value) {
    return 'de-DE'
  }

  return ALLOWED_LOCALES.includes(value as AllowedLocale)
    ? (value as AllowedLocale)
    : 'de-DE'
}

export const useRestaurantSettings = () => {
  const { firestore } = useFirebase()

  const settingsLoading = useState<boolean>('restaurant-settings-loading', () => false)
  const settingsLoaded = useState<boolean>('restaurant-settings-loaded', () => false)
  const currencyCode = useState<string>('restaurant-currency-code', () => 'EUR')
  const locale = useState<AllowedLocale>('restaurant-locale', () => 'de-DE')

  const loadRestaurantSettings = async (forceRefresh = false) => {
    if (!forceRefresh && settingsLoaded.value) {
      return
    }

    if (!firestore) {
      settingsLoaded.value = true
      return
    }

    settingsLoading.value = true

    try {
      const settingsRef = doc(firestore, SETTINGS_COLLECTION, SETTINGS_DOC_ID)
      const snapshot = await getDoc(settingsRef)

      if (snapshot.exists()) {
        const data = snapshot.data() as RestaurantSettingsData
        currencyCode.value = data.currencyCode || 'EUR'
        locale.value = normalizeLocale(data.locale)
      }

      settingsLoaded.value = true
    } finally {
      settingsLoading.value = false
    }
  }

  const formatCurrency = (value: number) => {
    const safeNumber = typeof value === 'number' && Number.isFinite(value) ? value : 0

    try {
      return new Intl.NumberFormat(locale.value, {
        style: 'currency',
        currency: currencyCode.value || 'EUR',
      }).format(safeNumber)
    } catch {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(safeNumber)
    }
  }

  return {
    currencyCode,
    locale,
    settingsLoading,
    settingsLoaded,
    loadRestaurantSettings,
    formatCurrency,
  }
}
