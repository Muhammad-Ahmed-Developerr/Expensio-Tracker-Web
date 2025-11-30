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
    
    const lastExpense = await db.collection("expenses")
      .find({ userId: new ObjectId(payload.userId as string) })
      .sort({ expenseNumber: -1 })
      .limit(1)
      .toArray()

    const nextNumber = lastExpense.length > 0 ? lastExpense[0].expenseNumber + 1 : 1

    return NextResponse.json({ nextNumber })
  } catch (error) {
    console.error("Get next expense number error:", error)
    return NextResponse.json({ message: "Failed to get next expense number" }, { status: 500 })
  }
}