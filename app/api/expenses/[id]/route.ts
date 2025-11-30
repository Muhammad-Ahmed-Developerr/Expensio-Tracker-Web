import { connectToDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  try {
    const payload = await verifyAuth()
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const expense = await db.collection("expenses").findOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(payload.userId as string),
    })

    if (!expense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...expense,
      _id: expense._id.toString(),
      userId: expense.userId.toString(),
    })
  } catch (error) {
    console.error("Fetch expense error:", error)
    return NextResponse.json({ message: "Failed to fetch expense" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  try {
    const payload = await verifyAuth()
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { expenseNumber, userName, title, amount, date, notes, currency } = body

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

    const existingExpense = await db.collection("expenses").findOne({
      userId: new ObjectId(payload.userId as string),
      expenseNumber: expenseNumber,
      _id: { $ne: new ObjectId(params.id) }
    })

    if (existingExpense) {
      return NextResponse.json({ message: "Expense number already exists" }, { status: 400 })
    }

    const result = await db.collection("expenses").updateOne(
      {
        _id: new ObjectId(params.id),
        userId: new ObjectId(payload.userId as string),
      },
      {
        $set: {
          userName: userName.trim(),
          title: title.trim(),
          amount: Math.round(amount),
          date: new Date(date),
          notes: notes?.trim() || null,
          currency: currency || "PKR",
          expenseNumber: expenseNumber,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 })
    }

    const updatedExpense = await db.collection("expenses").findOne({ _id: new ObjectId(params.id) })

    if (!updatedExpense) {
      return NextResponse.json({ message: "Expense not found after update" }, { status: 404 })
    }

    return NextResponse.json({
      ...updatedExpense,
      _id: updatedExpense._id.toString(),
      userId: updatedExpense.userId.toString(),
    })
  } catch (error) {
    console.error("Update expense error:", error)
    return NextResponse.json({ message: "Failed to update expense" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params

  try {
    const payload = await verifyAuth()
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("expenses").deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(payload.userId as string),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Delete expense error:", error)
    return NextResponse.json({ message: "Failed to delete expense" }, { status: 500 })
  }
}