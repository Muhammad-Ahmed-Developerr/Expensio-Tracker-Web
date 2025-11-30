"use client"

import type { Expense } from "@/lib/types"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Eye, Calendar, User, Hash, Receipt, Edit } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import EditExpenseModal from "./edit-expense-modal"

interface ExpenseCardProps {
  expense: Expense
  onRefresh: () => void
}

export default function ExpenseCard({ expense, onRefresh }: ExpenseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const formatCurrencyForNotification = (amount: number, currency: string = "PKR") => {
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
        ? `${expenseData.title} expense was updated to ${formatCurrencyForNotification(expenseData.amount, expenseData.currency)}`
        : type === 'expense_deleted'
        ? `${expenseData.title} expense of ${formatCurrencyForNotification(expenseData.amount, expenseData.currency)} was deleted`
        : `${expenseData.title} expense of ${formatCurrencyForNotification(expenseData.amount, expenseData.currency)} was added`,
      timestamp: new Date(),
      read: false,
      expenseId: expenseData._id
    }

    notifications.push(notification)
    localStorage.setItem("expenseNotifications", JSON.stringify(notifications))
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/expenses/${expense._id}`, {
        method: "DELETE",
      })

      if (response.ok) {

        addNotification('expense_deleted', expense)
        onRefresh()
      } else {
        console.error("Failed to delete expense")
      }
    } catch (error) {
      console.error("Failed to delete expense:", error)
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    onRefresh()
  }

  const date = new Date(expense.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        whileHover={{ y: -2, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 group border border-slate-200 dark:border-slate-700 hover:border-cyan-500/30 rounded-2xl backdrop-blur-sm"
      >
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-start gap-3">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <Receipt className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{expense.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-full text-xs font-medium">
                      <Hash className="w-3 h-3" />
                      #{expense.expenseNumber}
                    </span>
                    {expense.userSequentialId && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                        <User className="w-3 h-3" />
                        {expense.userSequentialId}
                      </span>
                    )}
                    {expense.userName && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-full text-xs">
                        {expense.userName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-600 dark:text-slate-400 text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {date}
                </span>
                {expense.notes && (
                  <span className="max-w-xs truncate text-slate-500 dark:text-slate-500">{expense.notes}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-4 sm:mt-0 sm:ml-6">
          <div className="text-right">
            <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{expense.currency}</p>
          </div>

          <motion.div 
            className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4"
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
          >
            <motion.a
              href={`/receipt/${expense._id}`}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-400 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <Eye className="w-4 h-4" />
            </motion.a>
            <motion.button
              onClick={() => setShowEditModal(true)}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-700 dark:text-green-400 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <Edit className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setShowConfirm(true)}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              disabled={isDeleting}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-400 rounded-xl transition-all duration-300 backdrop-blur-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit Expense Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditExpenseModal
            expense={expense}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleEditSuccess}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 max-w-sm w-full p-8 space-y-6 text-center rounded-2xl border border-slate-300 dark:border-slate-600 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Trash2 className="w-8 h-8 text-red-500" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Confirm Deletion</h3>
              <p className="text-slate-700 dark:text-slate-300 text-lg">
                Are you sure you want to delete <span className="text-slate-900 dark:text-white font-semibold">"{expense.title}"</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-4 pt-4">
                <motion.button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg shadow-red-500/25"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </motion.button>
                <motion.button
                  onClick={() => setShowConfirm(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold py-4 rounded-xl transition-all duration-300 border border-slate-300 dark:border-slate-600"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}