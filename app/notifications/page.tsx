// page.tsx (Notifications)
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Bell, CheckCircle, Info, X, Calendar, DollarSign, Edit, Trash2 } from "lucide-react"

interface Notification {
  id: string
  type: 'expense_created' | 'expense_updated' | 'expense_deleted'
  title: string
  message: string
  timestamp: Date | string
  read: boolean
  expenseId?: string
}

interface UserProfile {
  name: string
  email: string
  profileImage?: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    loadNotifications()

    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadNotifications = async () => {
    try {
      // Load saved notifications
      const saved = JSON.parse(localStorage.getItem("expenseNotifications") || "[]")
      const readStatus = JSON.parse(localStorage.getItem("notificationReadStatus") || "{}")

      // FIXED: Convert timestamps from strings to Date objects
      const savedNotifications: Notification[] = saved.map((n: Notification) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }))

      // Sort newest first and remove duplicates based on expenseId and type
      const uniqueNotifications = savedNotifications.reduce((acc: Notification[], current) => {
        const isDuplicate = acc.find(item => 
          item.expenseId === current.expenseId && 
          item.type === current.type &&
          new Date(item.timestamp).getTime() === new Date(current.timestamp).getTime()
        )
        if (!isDuplicate) {
          acc.push(current)
        }
        return acc
      }, []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Apply read status
      const withRead: Notification[] = uniqueNotifications.map((n) => ({
        ...n,
        read: readStatus[n.id] || false
      }))

      setNotifications(withRead)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    }
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

  const markAsRead = (id: string) => {
    const readStatus = JSON.parse(localStorage.getItem("notificationReadStatus") || "{}")
    readStatus[id] = true
    localStorage.setItem("notificationReadStatus", JSON.stringify(readStatus))

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    const readStatus = JSON.parse(localStorage.getItem("notificationReadStatus") || "{}")
    notifications.forEach((n) => (readStatus[n.id] = true))
    localStorage.setItem("notificationReadStatus", JSON.stringify(readStatus))

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    const readStatus = JSON.parse(localStorage.getItem("notificationReadStatus") || "{}")
    delete readStatus[id]
    localStorage.setItem("notificationReadStatus", JSON.stringify(readStatus))

    const updated = notifications.filter((n) => n.id !== id)
    setNotifications(updated)

    localStorage.setItem("expenseNotifications", JSON.stringify(updated))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "expense_created":
        return <DollarSign className="w-5 h-5 text-cyan-500" />
      case "expense_updated":
        return <Edit className="w-5 h-5 text-yellow-500" />
      case "expense_deleted":
        return <Trash2 className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  // FIXED: Always convert timestamp to Date before using getTime()
  const getTimeAgo = (timestamp: Date | string) => {
    const ts = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - ts.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return "Yesterday"
    return `${days}d ago`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6 text-cyan-600" />
            </motion.button>

            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p>{unreadCount} unread</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <motion.button
              onClick={markAllAsRead}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg"
            >
              Mark all as read
            </motion.button>
          )}
        </motion.div>

        {/* LIST */}
        <motion.div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl">
              <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold">No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl border-l-4 ${
                  notification.read
                    ? "border-l-slate-300"
                    : notification.type === 'expense_created' 
                      ? "border-l-cyan-500 bg-cyan-50/50"
                      : notification.type === 'expense_updated'
                        ? "border-l-yellow-500 bg-yellow-50/50"
                        : "border-l-red-500 bg-red-50/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>

                    <div className="flex-1">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="mb-2">{notification.message}</p>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {getTimeAgo(notification.timestamp)}
                        </span>

                        {notification.expenseId && (
                          <button
                            onClick={() => router.push(`/receipt/${notification.expenseId}`)}
                            className="text-cyan-600 hover:underline"
                          >
                            View Expense
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <motion.button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 rounded-lg"
                      >
                        <CheckCircle className="w-4 h-4 text-slate-500" />
                      </motion.button>
                    )}

                    <motion.button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 rounded-lg"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass p-6 text-center rounded-2xl">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
              {notifications.length}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Total</div>
          </div>
          
          <div className="glass p-6 text-center rounded-2xl">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
              {unreadCount}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Unread</div>
          </div>
          
          <div className="glass p-6 text-center rounded-2xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              {notifications.filter(n => n.type === 'expense_created').length}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Expense Alerts</div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}