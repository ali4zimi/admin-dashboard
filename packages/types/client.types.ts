import type { Timestamp } from 'firebase/firestore'

export type ClientStatus = 'active' | 'suspended' | 'trialing'
export type ClientPlan = 'free' | 'pro' | 'enterprise'

/**
 * The parent doc at clients/{clientId}.
 * Provisioned and owned by the super-admin app — the per-restaurant dashboard
 * only ever reads it (and reads `status` to decide whether to render).
 */
export interface ClientData {
  id?: string

  // Identity
  name: string
  logoUrl?: string
  contactEmail: string
  contactPhone?: string

  // Lifecycle / tenant control
  status: ClientStatus
  plan?: ClientPlan
  trialEndsAt?: Timestamp

  // Audit
  createdAt?: Timestamp
  updatedAt?: Timestamp
  createdBy?: string
}
