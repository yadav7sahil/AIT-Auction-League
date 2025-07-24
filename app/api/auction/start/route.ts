import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Auction from "@/models/Auction"
import Player from "@/models/Player"
import User from "@/models/User"

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
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + duration * 1000)

    const newAuction = new Auction({
      playerId,
      currentBid: player.basePrice,
      status: "active",
      startTime,
      endTime,
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

    // Schedule auto-end (you might want to use a job queue in production)
    setTimeout(async () => {
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auction/auto-end`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ auctionId: newAuction._id }),
        })
        console.log("Auto-end auction result:", await response.text())
      } catch (error) {
        console.error("Error auto-ending auction:", error)
      }
    }, duration * 1000)

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
