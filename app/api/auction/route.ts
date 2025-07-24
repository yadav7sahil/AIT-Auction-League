import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Auction from "@/models/Auction"
import Player from "@/models/Player"
import User from "@/models/User"

// GET - Get current active auction
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const activeAuction = await Auction.findOne({ status: "active" })
      .populate("playerId", "name position rollNo dept rating basePrice")
      .populate("highestBidderId", "name")
      .populate("bids.teamId", "name")

    if (!activeAuction) {
      return NextResponse.json({ message: "No active auction" }, { status: 404 })
    }

    return NextResponse.json(activeAuction)
  } catch (error) {
    console.error("Error fetching auction:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST - Start new auction (Admin only)
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

    const { playerId, duration = 30 } = await request.json()

    // Check if there's already an active auction
    const existingAuction = await Auction.findOne({ status: "active" })
    if (existingAuction) {
      return NextResponse.json({ message: "Another auction is already active" }, { status: 409 })
    }

    // Verify player exists and is available
    const player = await Player.findById(playerId)
    if (!player) {
      return NextResponse.json({ message: "Player not found" }, { status: 404 })
    }

    if (player.status !== "available") {
      return NextResponse.json({ message: "Player is not available for auction" }, { status: 400 })
    }

    // Create new auction
    const newAuction = new Auction({
      playerId,
      currentBid: player.basePrice,
      status: "active",
      startTime: new Date(),
      endTime: new Date(Date.now() + duration * 1000),
      duration,
      bids: [],
    })

    await newAuction.save()

    // Update player status
    await Player.findByIdAndUpdate(playerId, { status: "bidding" })

    // Populate the auction data
    const populatedAuction = await Auction.findById(newAuction._id)
      .populate("playerId", "name position rollNo dept rating basePrice")
      .populate("highestBidderId", "name")

    return NextResponse.json(
      {
        message: "Auction started successfully",
        auction: populatedAuction,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error starting auction:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
