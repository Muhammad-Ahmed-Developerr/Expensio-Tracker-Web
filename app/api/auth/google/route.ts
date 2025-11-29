import { connectToDatabase, getNextUserId } from "@/lib/mongodb"
import { createToken } from "@/lib/auth"
import { jwtDecode } from "jwt-decode"
import { type NextRequest, NextResponse } from "next/server"

interface GoogleToken {
  sub: string
  email: string
  name: string
  picture?: string
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 })
    }

    // Decode Google token
    let decoded: GoogleToken
    try {
      decoded = jwtDecode<GoogleToken>(token)
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find or create user
    let user = await db.collection("users").findOne({ googleId: decoded.sub })

    if (!user) {
      // Get next sequential user ID
      const userId = await getNextUserId()
      
      const result = await db.collection("users").insertOne({
        userId: userId,
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        profileImage: decoded.picture || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      user = await db.collection("users").findOne({ _id: result.insertedId })
    } else {
      // Update user info if already exists
      await db.collection("users").updateOne(
        { _id: user._id },
        { 
          $set: { 
            name: decoded.name,
            profileImage: decoded.picture || user.profileImage,
            updatedAt: new Date()
          } 
        }
      )
      user = await db.collection("users").findOne({ _id: user._id })
    }

    if (!user) {
      return NextResponse.json({ message: "User creation failed" }, { status: 500 })
    }

    // Create JWT token with userId
    const jwtToken = await createToken(user._id.toString(), user.email)
    
    // Set HTTP-only cookie
    const response = NextResponse.json({
      user: {
        id: user._id.toString(),
        userId: user.userId,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
      }
    })

    // Set the cookie
    response.cookies.set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error("Google auth error:", error)
    return NextResponse.json({ message: "Authentication failed" }, { status: 500 })
  }
}