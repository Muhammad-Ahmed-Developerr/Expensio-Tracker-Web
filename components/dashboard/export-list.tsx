// export-list.tsx
"use client"

import { useCallback, useState } from "react"
import { Download, FileDown, Loader } from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { motion } from "framer-motion"
import type { Expense } from "@/lib/types"

interface ExportListProps {
  expenses: Expense[]
  userName: string
}

interface CurrencySummary {
  currency: string
  total: number
  count: number
}

export default function ExportList({ expenses, userName }: ExportListProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Helper function to format amount correctly (divide by 100 and format without commas/dots)
  const formatAmountForExport = (amount: number): string => {
    const actualAmount = amount / 100
    const isWhole = actualAmount % 1 === 0
    
    return actualAmount.toLocaleString('en-US', {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: isWhole ? 0 : 2,
      useGrouping: false // This removes commas/dots in thousands
    })
  }

  // Helper function to format amount with currency symbol
  const formatAmountWithSymbol = (amount: number, currency: string): string => {
    const actualAmount = amount / 100
    const isWhole = actualAmount % 1 === 0
    
    const formattedAmount = actualAmount.toLocaleString('en-US', {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: isWhole ? 0 : 2,
      useGrouping: false // This removes commas/dots in thousands
    })

    const currencySymbols: { [key: string]: string } = {
      'PKR': 'Rs', // Using 'Rs' instead of '₨' for better PDF compatibility
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    }

    const symbol = currencySymbols[currency] || currency
    return `${symbol} ${formattedAmount}`
  }

  const handleExportPDF = useCallback(async () => {
    if (expenses.length === 0) return

    setIsExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let yPos = 20

      // Header with gradient effect simulation
      doc.setFillColor(6, 182, 212) // Cyan-500
      doc.rect(0, 0, pageWidth, 80, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("EXPENSE REPORT", pageWidth / 2, 30, { align: "center" })
      
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated for: ${userName}`, pageWidth / 2, 45, { align: "center" })
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: "center" })
      doc.text(`Total Expenses: ${expenses.length}`, pageWidth / 2, 65, { align: "center" })

      yPos = 90

      // Group expenses by currency and calculate totals
      const expensesByCurrency: { [key: string]: Expense[] } = {}
      const currencySummaries: { [key: string]: CurrencySummary } = {}

      expenses.forEach(expense => {
        const currency = expense.currency || 'PKR'
        if (!expensesByCurrency[currency]) {
          expensesByCurrency[currency] = []
          currencySummaries[currency] = {
            currency,
            total: 0,
            count: 0
          }
        }
        expensesByCurrency[currency].push(expense)
        currencySummaries[currency].total += expense.amount
        currencySummaries[currency].count += 1
      })

      // Table for each currency
      Object.entries(expensesByCurrency).forEach(([currency, currencyExpenses], currencyIndex) => {
        if (currencyIndex > 0) {
          doc.addPage()
          yPos = 20
        }

        // Currency header
        doc.setTextColor(6, 182, 212) // Cyan-500
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text(`Currency: ${currency}`, 14, yPos)
        yPos += 15

        // Prepare table data - FIXED: Divide by 100 and remove dots/commas
        const tableData = currencyExpenses.map(expense => [
          `#${expense.expenseNumber}`,
          new Date(expense.date).toLocaleDateString(),
          expense.title.length > 30 ? expense.title.substring(0, 30) + '...' : expense.title,
          expense.userName,
          // FIXED: Divide by 100 and format without dots/commas
          formatAmountWithSymbol(expense.amount, expense.currency),
          expense.notes && expense.notes.length > 20 ? expense.notes.substring(0, 20) + '...' : (expense.notes || 'N/A')
        ])

        // Create table
        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Date', 'Title', 'User', 'Amount', 'Notes']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [6, 182, 212], // Cyan-500
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          },
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          margin: { left: 14, right: 14 }
        })

        // Add summary for this currency - CENTERED
        const finalY = (doc as any).lastAutoTable.finalY + 15
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        const summary = currencySummaries[currency]
        // FIXED: Divide by 100 and format without dots/commas
        const totalFormatted = formatAmountWithSymbol(summary.total, currency)
        
        // Center the total text
        const totalText = `Total ${currency}: ${totalFormatted} (${summary.count} expenses)`
        const textWidth = doc.getTextWidth(totalText)
        const xPosition = (pageWidth - textWidth) / 2
        
        doc.text(totalText, xPosition, finalY)
      })

      // Add overall summary page if multiple currencies
      if (Object.keys(expensesByCurrency).length > 1) {
        doc.addPage()
        yPos = 20

        doc.setTextColor(6, 182, 212)
        doc.setFontSize(18)
        doc.setFont("helvetica", "bold")
        doc.text("SUMMARY REPORT", pageWidth / 2, yPos, { align: "center" })
        yPos += 20

        const summaryData = Object.values(currencySummaries).map(summary => [
          summary.currency,
          summary.count.toString(),
          // FIXED: Divide by 100 and format without dots/commas
          formatAmountWithSymbol(summary.total, summary.currency)
        ])

        autoTable(doc, {
          startY: yPos,
          head: [['Currency', 'Number of Expenses', 'Total Amount']],
          body: summaryData,
          theme: 'grid',
          headStyles: {
            fillColor: [6, 182, 212],
            textColor: 255,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 10,
            cellPadding: 4,
          },
          margin: { left: 14, right: 14 }
        })

        // Don't show grand total for multiple currencies as it doesn't make sense
        // with different currencies
      }

      // Add footer to each page
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" })
        doc.text(`Generated by ExpenseTracker • ${new Date().toLocaleString()}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: "center" })
      }

      doc.save(`expense-report-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("PDF export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }, [expenses, userName])

  const handleExportCSV = useCallback(() => {
    if (expenses.length === 0) return

    const headers = ["Expense #", "Date", "Title", "Amount", "Currency", "User", "User ID", "Notes"]
    const rows = expenses.map((exp) => [
      exp.expenseNumber.toString(),
      new Date(exp.date).toLocaleDateString(),
      exp.title,
      // FIXED: Divide by 100 and format without dots/commas
      formatAmountForExport(exp.amount),
      exp.currency,
      exp.userName,
      exp.userSequentialId,
      exp.notes || "",
    ])

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `expense-report-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }, [expenses])

  return (
    <motion.div 
      className="flex gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.button
        onClick={handleExportPDF}
        disabled={isExporting || expenses.length === 0}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 backdrop-blur-sm"
      >
        {isExporting ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          <FileDown className="w-5 h-5" />
        )}
        {isExporting ? "Generating PDF..." : "Export PDF"}
      </motion.button>
      
      <motion.button
        onClick={handleExportCSV}
        disabled={expenses.length === 0}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-bold transition-all duration-300 disabled:opacity-50 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 backdrop-blur-sm"
      >
        <Download className="w-5 h-5" />
        Export CSV
      </motion.button>
    </motion.div>
  )
}