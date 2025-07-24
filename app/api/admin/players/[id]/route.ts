import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Player from "@/models/Player"
import User from "@/models/User"

// DELETE - Delete player (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const deletedPlayer = await Player.findByIdAndDelete(params.id)
    if (!deletedPlayer) {
      return NextResponse.json({ message: "Player not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Player deleted successfully" })
  } catch (error) {
    console.error("Error deleting player:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update player (Admin only)
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

    const updateData = await request.json()

    // Validate rating and price if provided
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 100)) {
      return NextResponse.json({ message: "Rating must be between 1 and 100" }, { status: 400 })
    }

    if (updateData.basePrice && updateData.basePrice < 10) {
      return NextResponse.json({ message: "Base price must be at least $10" }, { status: 400 })
    }

    const updatedPlayer = await Player.findByIdAndUpdate(
      params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true },
    )

    if (!updatedPlayer) {
      return NextResponse.json({ message: "Player not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Player updated successfully",
      player: updatedPlayer,
    })
  } catch (error) {
    console.error("Error updating player:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
