import { connectToDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {

    const payload = await verifyAuth()

    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(payload.userId as string) })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      userId: user.userId,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ message: "Authentication failed" }, { status: 500 })
  }
}
