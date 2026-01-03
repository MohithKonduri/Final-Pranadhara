export interface Donor {
  id: string
  name: string
  rollNumber: string
  email: string
  phone: string
  whatsappNumber: string
  bloodGroup: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-"
  area: string
  district: string
  department: string
  year: string
  section: string
  age?: number
  birthdate?: string
  lastDonationDate?: string
  isAvailable: boolean
  donationStatus: "Available" | "Donated" | "Referred"
  createdAt: string
  updatedAt: string
}

export interface EmergencyRequest {
  id: string
  bloodGroup: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-"
  district: string
  urgency: "low" | "medium" | "high" | "critical"
  description: string
  contactName: string
  contactPhone: string
  createdAt: string
  status: "open" | "fulfilled" | "closed"
}

export interface BloodCompatibility {
  canDonate: string[]
  canReceive: string[]
}

export interface Camp {
  id: string
  name: string
  location: string
  district: string
  date: string
  time?: string // Added for Google Sheets
  startTime?: string
  endTime?: string
  description?: string
  organizer: string
  contact?: string // Added for Google Sheets
  contactPhone?: string
  contactEmail?: string
  expectedDonors?: number
  actualDonors?: number
  status?: "upcoming" | "ongoing" | "completed" | "cancelled" // Made optional
  imageUrl?: string // Image URL from Google Sheets
  createdAt?: string // Made optional
  updatedAt?: string // Made optional
}

export interface PranadharaAdmin {
  id: string
  name: string
  email: string
  phone: string
  role: "super_admin" | "admin" | "moderator"
  photoUrl?: string // Photo URL from Google Sheets
  designation?: string
  permissions: {
    manageDonors: boolean
    manageEmergencies: boolean
    manageCamps: boolean
    manageAdmins: boolean
    sendNotifications: boolean
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
}
