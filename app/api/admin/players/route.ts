import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Player from "@/models/Player"
import User from "@/models/User"

// GET - Fetch all players (Admin only)
export async function GET(request: NextRequest) {
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

    const players = await Player.find({}).populate("teamId", "name").sort({ createdAt: -1 })

    return NextResponse.json(players)
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new player (Admin only)
export async function POST(request: NextRequest) {
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

    const { name, position, rollNo, dept, rating, basePrice, description } = await request.json()

    // Validate input
    if (!name || !position || !rollNo || !dept || !rating || !basePrice) {
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 })
    }

    // Check if roll number already exists
    const existingPlayer = await Player.findOne({ rollNo })
    if (existingPlayer) {
      return NextResponse.json({ message: "Player with this roll number already exists" }, { status: 409 })
    }

    // Validate rating and price
    if (rating < 1 || rating > 100) {
      return NextResponse.json({ message: "Rating must be between 1 and 100" }, { status: 400 })
    }

    if (basePrice < 10) {
      return NextResponse.json({ message: "Base price must be at least $10" }, { status: 400 })
    }

    // Create new player
    const newPlayer = new Player({
      name,
      position,
      rollNo,
      dept,
      rating,
      basePrice,
      description,
      status: "available",
      createdAt: new Date(),
    })

    await newPlayer.save()

    return NextResponse.json(
      {
        message: "Player added successfully",
        player: newPlayer,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating player:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
