import { MongoClient, type Db } from "mongodb"

interface Counter {
  _id: string
  sequence: number
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is not set")
  }

  const client = new MongoClient(mongoUri)
  await client.connect()

  const db = client.db("expense_tracker")

  const counter = await db.collection<Counter>("counters").findOne({ _id: "userId" } as any)
  if (!counter) {
    await db.collection<Counter>("counters").insertOne({
      _id: "userId",
      sequence: 0
    })
  }

  const expenseCounter = await db.collection<Counter>("counters").findOne({ _id: "expenseNumber" } as any)
  if (!expenseCounter) {
    await db.collection<Counter>("counters").insertOne({
      _id: "expenseNumber",
      sequence: 0
    })
  }

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

export async function getNextUserId(): Promise<string> {
  const { db } = await connectToDatabase()
  
  const result = await db.collection<Counter>("counters").findOneAndUpdate(
    { _id: "userId" } as any,
    { $inc: { sequence: 1 } },
    { returnDocument: 'after', upsert: true }
  )
  
  const sequence = result?.sequence || 1
  return `user${sequence.toString().padStart(3, '0')}`
}

export async function getNextExpenseNumber(): Promise<number> {
  const { db } = await connectToDatabase()
  
  const result = await db.collection<Counter>("counters").findOneAndUpdate(
    { _id: "expenseNumber" } as any,
    { $inc: { sequence: 1 } },
    { returnDocument: 'after', upsert: true }
  )
  
  return result?.sequence || 1
}