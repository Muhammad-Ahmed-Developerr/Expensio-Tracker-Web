// add-expense-modal.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, DollarSign, Calendar, FileText, Currency, Hash } from "lucide-react"

interface AddExpenseModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface UserProfile {
  name: string
  email: string
}

export default function AddExpenseModal({ onClose, onSuccess }: AddExpenseModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [nextExpenseNumber, setNextExpenseNumber] = useState(1)
  const [formData, setFormData] = useState({
    expenseNumber: "",
    userName: "",
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    currency: "PKR",
  })

  useEffect(() => {
    fetchUserProfile()
    fetchNextExpenseNumber()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
        setFormData(prev => ({ ...prev, userName: data.name }))
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    }
  }

  const fetchNextExpenseNumber = async () => {
    try {
      const response = await fetch("/api/expenses/next-number")
      if (response.ok) {
        const data = await response.json()
        setNextExpenseNumber(data.nextNumber)
        setFormData(prev => ({ ...prev, expenseNumber: data.nextNumber.toString() }))
      }
    } catch (error) {
      console.error("Failed to fetch next expense number:", error)
      const fallbackNumber = Math.floor(Date.now() / 1000)
      setNextExpenseNumber(fallbackNumber)
      setFormData(prev => ({ ...prev, expenseNumber: fallbackNumber.toString() }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const formatCurrency = (amount: number, currency: string = "PKR") => {
    const v = amount / 100
    const isWhole = v % 1 === 0

    const formatted = v.toLocaleString("en-US", {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: isWhole ? 0 : 2
    })

    const symbols: any = {
      PKR: "₨",
      USD: "$",
      EUR: "€",
      GBP: "£"
    }

    return `${symbols[currency] || currency} ${formatted}`
  }

  const addNotification = (type: 'expense_created' | 'expense_updated' | 'expense_deleted', expenseData: any) => {
    const notifications = JSON.parse(localStorage.getItem("expenseNotifications") || "[]")
    
    const notification = {
      id: `${expenseData._id}-${type}-${Date.now()}`,
      type,
      title: type === 'expense_updated' ? 'Expense Updated' : 
             type === 'expense_deleted' ? 'Expense Deleted' : 'New Expense Added',
      message: type === 'expense_updated' 
        ? `${expenseData.title} expense was updated to ${formatCurrency(expenseData.amount, expenseData.currency)}`
        : type === 'expense_deleted'
        ? `${expenseData.title} expense of ${formatCurrency(expenseData.amount, expenseData.currency)} was deleted`
        : `${expenseData.title} expense of ${formatCurrency(expenseData.amount, expenseData.currency)} was added`,
      timestamp: new Date(),
      read: false,
      expenseId: expenseData._id
    }

    notifications.push(notification)
    localStorage.setItem("expenseNotifications", JSON.stringify(notifications))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!formData.title.trim()) {
      setError("Title is required")
      setIsLoading(false)
      return
    }

    if (!formData.userName.trim()) {
      setError("Your name is required")
      setIsLoading(false)
      return
    }

    const amount = Number.parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      setIsLoading(false)
      return
    }

    const expenseNumber = Number.parseInt(formData.expenseNumber)
    if (isNaN(expenseNumber) || expenseNumber <= 0) {
      setError("Please enter a valid expense number")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expenseNumber,
          userName: formData.userName.trim(),
          title: formData.title.trim(),
          amount: Math.round(amount * 100),
          date: new Date(formData.date),
          notes: formData.notes.trim() || undefined,
          currency: formData.currency,
        }),
      })

      if (response.ok) {
        const createdExpense = await response.json()
        // Add notification for expense creation
        addNotification('expense_created', createdExpense)
        onSuccess()
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to create expense")
      }
    } catch (err) {
      setError("An error occurred while creating the expense")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="glass max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-slate-300 dark:border-slate-600 shadow-2xl rounded-2xl backdrop-blur-xl bg-white dark:bg-slate-900"
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-300 z-10"
          >
            <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 p-8 pb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25"
            >
              <DollarSign className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              Add New Expense
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Track your spending with detailed information</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-8 mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl backdrop-blur-sm"
            >
              <p className="text-red-600 dark:text-red-400 text-sm font-medium text-center">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 p-8 pt-0">
            {/* User Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                User Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Expense Number *
                  </label>
                  <input
                    type="number"
                    name="expenseNumber"
                    value={formData.expenseNumber}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">Suggested: #{nextExpenseNumber}</p>
                </div>
              </div>
            </motion.div>

            {/* Expense Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-700"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Expense Details
              </h3>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Expense Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Grocery Shopping, Office Supplies, etc."
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                    required
                  />
                </div>

                {/* Amount, Currency, and Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Currency
                    </label>
                    <div className="relative">
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 appearance-none"
                      >
                        <option value="PKR">🇵🇰 PKR - Pakistani Rupee</option>
                        <option value="USD">🇺🇸 USD - US Dollar</option>
                        <option value="EUR">🇪🇺 EUR - Euro</option>
                        <option value="GBP">🇬🇧 GBP - British Pound</option>
                        <option value="AED">🇦🇪 AED - UAE Dirham</option>
                        <option value="SAR">🇸🇦 SAR - Saudi Riyal</option>
                        <option value="INR">🇮🇳 INR - Indian Rupee</option>
                        <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Add any additional details, description, or context for this expense..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Expense...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5" />
                    <span>Add Expense</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl transition-all duration-300 border border-slate-300 dark:border-slate-600"
              >
                Cancel
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}