import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || ""

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db("expense_tracker")

    // Create collections
    await db.createCollection("users").catch(() => {})
    await db.createCollection("expenses").catch(() => {})

    // Create indexes
    await db.collection("users").createIndex({ googleId: 1 }, { unique: true })
    await db.collection("users").createIndex({ email: 1 })
    await db.collection("expenses").createIndex({ userId: 1 })
    await db.collection("expenses").createIndex({ date: 1 })
    await db.collection("expenses").createIndex({ userId: 1, date: 1 })

    // Seed sample data
    const userResult = await db.collection("users").insertOne({
      googleId: "google_123456789",
      email: "demo@example.com",
      name: "Demo User",
      profileImage: "https://via.placeholder.com/150",
      createdAt: new Date(),
    })

    const userId = userResult.insertedId.toString()

    const expenses = [
      {
        userId: userId,
        title: "Grocery Shopping",
        amount: 5500,
        date: new Date("2025-01-20"),
        notes: "Weekly groceries",
        currency: "PKR",
        createdAt: new Date(),
      },
      {
        userId: userId,
        title: "Fuel",
        amount: 2000,
        date: new Date("2025-01-21"),
        notes: "Car fuel",
        currency: "PKR",
        createdAt: new Date(),
      },
      {
        userId: userId,
        title: "Restaurant",
        amount: 3500,
        date: new Date("2025-01-22"),
        notes: "Lunch with friends",
        currency: "PKR",
        createdAt: new Date(),
      },
    ]

    await db.collection("expenses").insertMany(expenses)

    console.log("Database seeded successfully!")
  } finally {
    await client.close()
  }
}

seedDatabase().catch(console.error)
