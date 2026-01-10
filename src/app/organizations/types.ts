export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null
  metadata?: any
  createdAt: Date
}

export interface OrganizationMember {
  id: string
  organizationId: string
  role: string
  createdAt: Date
  userId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export interface OrganizationInvitation {
  id: string
  organizationId: string
  email: string
  role: string
  status: "pending" | "accepted" | "rejected" | "canceled"
  expiresAt: Date | null
  createdAt: Date
  inviterId: string
}

export interface FullOrganization extends Organization {
  members: OrganizationMember[]
  invitations: OrganizationInvitation[]
}
