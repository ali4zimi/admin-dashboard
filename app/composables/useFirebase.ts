export const useFirebase = () => {
  const nuxtApp = useNuxtApp()

  return {
    firebase: nuxtApp.$firebase,
    auth: nuxtApp.$auth,
    firestore: nuxtApp.$firestore,
    storage: nuxtApp.$storage,
  }
}
