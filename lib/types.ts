export interface User {
  _id?: string
  userId: string // Sequential ID: user001, user002, etc.
  googleId: string
  email: string
  name: string
  profileImage?: string
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  _id?: string
  userId: string // MongoDB ObjectId
  userSequentialId: string // user001, user002, etc.
  userName: string
  title: string
  amount: number
  date: Date
  notes?: string
  receiptImage?: string
  currency: string
  expenseNumber: number // New field for manual expense numbering
  createdAt: Date
}

export interface ExpenseFilters {
  startDate?: Date
  endDate?: Date
  searchQuery?: string
  page?: number
  limit?: number
}