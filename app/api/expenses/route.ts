import { connectToDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth()
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const { searchParams } = new URL(request.url)

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const searchQuery = searchParams.get("q")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // Build query
    const query: any = {
      userId: new ObjectId(payload.userId as string),
    }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        query.date.$lte = end
      }
    }

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { userName: { $regex: searchQuery, $options: "i" } },
        { userSequentialId: { $regex: searchQuery, $options: "i" } },
        { notes: { $regex: searchQuery, $options: "i" } },
        { expenseNumber: { $regex: searchQuery, $options: "i" } }
      ]
    }

    const expenses = await db
      .collection("expenses")
      .find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const count = await db.collection("expenses").countDocuments(query)

    return NextResponse.json({
      expenses: expenses.map((exp) => ({
        ...exp,
        _id: exp._id.toString(),
        userId: exp.userId.toString(),
      })),
      total,
      count,
      page,
      pages: Math.ceil(count / limit),
    })
  } catch (error) {
    console.error("Fetch expenses error:", error)
    return NextResponse.json({ message: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth()
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { expenseNumber, userName, title, amount, date, notes, currency } = body

    // Validation
    if (!expenseNumber || typeof expenseNumber !== "number" || expenseNumber <= 0) {
      return NextResponse.json({ message: "Valid expense number is required" }, { status: 400 })
    }

    if (!userName || typeof userName !== "string" || !userName.trim()) {
      return NextResponse.json({ message: "Valid user name is required" }, { status: 400 })
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ message: "Valid title is required" }, { status: 400 })
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ message: "Valid amount is required" }, { status: 400 })
    }

    if (!date) {
      return NextResponse.json({ message: "Date is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if expense number already exists for this user
    const existingExpense = await db.collection("expenses").findOne({
      userId: new ObjectId(payload.userId as string),
      expenseNumber: expenseNumber
    })

    if (existingExpense) {
      return NextResponse.json({ message: "Expense number already exists" }, { status: 400 })
    }

    // Get user to include sequential ID
    const user = await db.collection("users").findOne({ 
      _id: new ObjectId(payload.userId as string) 
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const result = await db.collection("expenses").insertOne({
      userId: new ObjectId(payload.userId as string),
      userSequentialId: user.userId, // user001, user002, etc.
      userName: userName.trim(),
      title: title.trim(),
      amount: Math.round(amount),
      date: new Date(date),
      notes: notes?.trim() || null,
      currency: currency || "PKR",
      expenseNumber: expenseNumber,
      createdAt: new Date(),
    })

    const expense = await db.collection("expenses").findOne({ _id: result.insertedId })

    if (!expense) {
      return NextResponse.json({ message: "Expense not found after creation" }, { status: 404 })
    }

    return NextResponse.json({
      ...expense,
      _id: expense._id.toString(),
      userId: expense.userId.toString(),
    })
  } catch (error) {
    console.error("Create expense error:", error)
    return NextResponse.json({ message: "Failed to create expense" }, { status: 500 })
  }
}