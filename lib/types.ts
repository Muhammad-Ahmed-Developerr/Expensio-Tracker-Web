export interface User {
  _id?: string
  userId: string 
  googleId: string
  email: string
  name: string
  profileImage?: string
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  _id?: string
  userId: string 
  userSequentialId: string 
  userName: string
  title: string
  amount: number
  date: Date
  notes?: string
  receiptImage?: string
  currency: string
  expenseNumber: number 
  createdAt: Date
}

export interface ExpenseFilters {
  startDate?: Date
  endDate?: Date
  searchQuery?: string
  page?: number
  limit?: number
}