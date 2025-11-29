import { connectToDatabase } from "@/lib/mongodb"
import { verifyAuth } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface CloudinaryUploadResult {
  secure_url: string
  // Add other properties you might need from Cloudinary response
  public_id?: string
  version?: number
  // ... other Cloudinary properties
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth()
    if (!payload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 })
    }

    // Validate file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ message: "File size must be less than 5MB" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'expense-tracker/profiles',
          public_id: `user-${payload.userId}`,
          overwrite: true,
          transformation: [
            { width: 200, height: 200, crop: 'fill' },
            { quality: 'auto' },
            { format: 'webp' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as CloudinaryUploadResult)
        }
      )
    })

    const { db } = await connectToDatabase()

    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(payload.userId as string) },
        { $set: { profileImage: uploadResult.secure_url, updatedAt: new Date() } },
      )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.userId as string) })

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
    console.error("Upload profile image error:", error)
    return NextResponse.json({ message: "Failed to upload image" }, { status: 500 })
  }
}