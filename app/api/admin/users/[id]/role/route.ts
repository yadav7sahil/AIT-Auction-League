import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

// PATCH - Update user role (Admin only)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    // Verify user is admin
    const user = await User.findById(decoded.userId)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { role } = await request.json()

    // Validate role
    const validRoles = ["admin", "captain", "player", "viewer"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }

    // Prevent admin from changing their own role
    if (decoded.userId === params.id && role !== "admin") {
      return NextResponse.json({ message: "Cannot change your own admin role" }, { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { role, updatedAt: new Date() },
      { new: true, select: { password: 0 } },
    )

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "User role updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
