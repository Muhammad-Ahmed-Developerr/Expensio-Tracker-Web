"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Bell, Moon, Sun, Download, Trash2, Shield, User, Globe, X } from "lucide-react"
import { useTheme } from "next-themes"

interface UserProfile {
  name: string
  email: string
  profileImage?: string
}

interface AppSettings {
  autoBackup: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  currency: string
  language: string
  dateFormat: string
  exportFormat: string
}

interface Notification {
  type: 'success' | 'error'
  message: string
  id: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    autoBackup: true,
    emailNotifications: true,
    pushNotifications: false,
    currency: "pkr",
    language: "english",
    dateFormat: "MM/DD/YYYY",
    exportFormat: "pdf"
  })

  useEffect(() => {
    setMounted(true)
    fetchProfile()
    loadSettings()
  }, [])

  const addNotification = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString()
    const notification: Notification = { type, message, id }
    setNotifications(prev => [...prev, notification])

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      addNotification('error', 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      addNotification('error', 'Failed to load settings')
    }
  }

  // typed to accept AppSettings value variants
  const handleSettingChange = (key: keyof AppSettings, value: AppSettings[keyof AppSettings]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
  }

  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings))
      addNotification('success', 'Settings saved successfully!')
    } catch (error) {
      console.error(error)
      addNotification('error', 'Failed to save settings')
    }
  }

  const handleExportAllData = async () => {
    try {
      const response = await fetch('/api/expenses?limit=1000')
      if (response.ok) {
        const data = await response.json()

        if (data.expenses.length === 0) {
          addNotification('error', 'No data available to export')
          return
        }

        // Export as CSV
        const headers = ["Expense #", "Date", "Title", "Amount", "Currency", "User", "Notes"]
        const rows = data.expenses.map((exp: any) => [
          exp.expenseNumber.toString(),
          new Date(exp.date).toLocaleDateString(),
          exp.title,
          (exp.amount / 100).toString(),
          exp.currency,
          exp.userName,
          exp.notes || ""
        ])

        const csv = [
          headers.join(","),
          ...rows.map((row: string[]) =>
            row.map(cell => `"${cell}"`).join(",")
          )
        ].join("\n")

        const blob = new Blob([csv], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `expense-tracker-backup-${new Date().toISOString().split("T")[0]}.csv`
        link.click()
        window.URL.revokeObjectURL(url)

        addNotification('success', 'Data exported successfully!')
      } else {
        throw new Error('Failed to fetch data')
      }
    } catch (error) {
      console.error(error)
      addNotification('error', 'Failed to export data')
    }
  }

  const handleClearAllData = async () => {
    setShowClearDataConfirm(true)
  }

  const confirmClearAllData = async () => {
    try {
      // Get all expenses first
      const response = await fetch('/api/expenses?limit=1000')
      if (response.ok) {
        const data = await response.json()

        if (data.expenses.length === 0) {
          addNotification('error', 'No data to clear')
          setShowClearDataConfirm(false)
          return
        }

        // Delete each expense
        const deletePromises = data.expenses.map((expense: any) =>
          fetch(`/api/expenses/${expense._id}`, { method: "DELETE" })
        )

        await Promise.all(deletePromises)
        addNotification('success', 'All data cleared successfully!')
      }
    } catch (error) {
      console.error(error)
      addNotification('error', 'Failed to clear data')
    } finally {
      setShowClearDataConfirm(false)
    }
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-8 px-4">
      {/* Clear Data Confirmation Modal */}
      {showClearDataConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Clear All Data
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to clear ALL your expense data? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearDataConfirm(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAllData}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border ${
              notification.type === 'success'
                ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
                : 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
            }`}
          >
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <motion.button
            onClick={() => router.back()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-white dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </motion.button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-400 dark:to-blue-500">
            App Settings
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4 rounded-2xl"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>

              <motion.button
                onClick={handleExportAllData}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 rounded-xl transition-all duration-300 border border-cyan-500/20"
              >
                <Download className="w-5 h-5" />
                Export All Data
              </motion.button>

              <motion.button
                onClick={handleClearAllData}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 rounded-xl transition-all duration-300 border border-red-500/20"
              >
                <Trash2 className="w-5 h-5" />
                Clear All Data
              </motion.button>
            </motion.div>

            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4 rounded-2xl"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">User Information</h3>
              <div className="flex items-center gap-3">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    {profile?.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{profile?.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{profile?.email}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appearance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6 rounded-2xl"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {currentTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                Appearance
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Theme</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Choose your preferred theme</p>
                  </div>
                  <select
                    value={theme || 'system'}
                    onChange={(e) => setTheme(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6 rounded-2xl"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h3>

              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates about your expenses' },
                  { key: 'pushNotifications', label: 'Push Notifications', description: 'Get real-time notifications in your browser' },
                  { key: 'autoBackup', label: 'Auto Backup', description: 'Automatically backup your data weekly' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                    </div>
                    <button
                      onClick={() =>
                        // cast because TS cannot infer this key is boolean here
                        handleSettingChange(item.key as keyof AppSettings, !(settings[item.key as keyof AppSettings] as boolean))
                      }
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                        Boolean(settings[item.key as keyof AppSettings])
                          ? 'bg-cyan-500'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          Boolean(settings[item.key as keyof AppSettings]) ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6 rounded-2xl"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Preferences
              </h3>

              <div className="space-y-4">
                {[
                  { key: 'currency', label: 'Default Currency', options: ['PKR', 'USD', 'EUR', 'GBP'] },
                  { key: 'language', label: 'Language', options: ['English', 'Urdu', 'Arabic'] },
                  { key: 'dateFormat', label: 'Date Format', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
                  { key: 'exportFormat', label: 'Export Format', options: ['PDF', 'CSV', 'Excel'] }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                    </div>
                    <select
                      // cast here: we know these specific keys are strings
                      value={settings[item.key as keyof AppSettings] as string}
                      onChange={(e) => handleSettingChange(item.key as keyof AppSettings, e.target.value)}
                      className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {item.options.map(option => (
                        <option key={option} value={option.toLowerCase()}>{option}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.button
              onClick={handleSaveSettings}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-cyan-500/25"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </motion.button>
          </div>
        </div>
      </div>
    </main>
  )
}
