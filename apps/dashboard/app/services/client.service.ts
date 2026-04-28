/**
 * Client Service - Reads the parent clients/{clientId} doc.
 * The super-admin app owns this document; this service is read-only.
 */

import { getDoc } from 'firebase/firestore'
import { clientRootDoc } from './firebase'
import type { ClientData } from '~/types/client.types'

export const fetchClient = async (): Promise<ClientData | null> => {
  const ref = clientRootDoc()
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    return null
  }

  return { id: snap.id, ...snap.data() } as ClientData
}
