"use client"

import type { Expense } from "@/lib/types"
import ExpenseCard from "./expense-card"
import { motion } from "framer-motion"

interface ExpenseListProps {
  expenses: Expense[]
  isLoading: boolean
  onRefresh: () => void
}

export default function ExpenseList({ expenses, isLoading, onRefresh }: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="glass p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-12 text-center space-y-4"
      >
        <p className="text-foreground-secondary text-lg">No expenses found</p>
        <p className="text-foreground-tertiary text-sm">Add your first expense to get started</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense, index) => (
        <motion.div
          key={expense._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ExpenseCard expense={expense} onRefresh={onRefresh} />
        </motion.div>
      ))}
    </div>
  )
}