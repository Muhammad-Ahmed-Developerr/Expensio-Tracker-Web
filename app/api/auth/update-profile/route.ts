import { connectToDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {

    const payload = await verifyAuth()
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ message: "Valid name is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(payload.userId as string) },
        { $set: { name: name.trim(), updatedAt: new Date() } },
      )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(payload.userId as string) })

    if (!user) {
      return NextResponse.json({ message: "User not found after update" }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      userId: user.userId,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 })
  }
}
