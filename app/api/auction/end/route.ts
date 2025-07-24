import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Auction from "@/models/Auction"
import Player from "@/models/Player"
import Team from "@/models/Team"
import User from "@/models/User"

// POST - End auction (Admin only or automatic)
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

    const { auctionId } = await request.json()

    const auction = await Auction.findById(auctionId)
    if (!auction) {
      return NextResponse.json({ message: "Auction not found" }, { status: 404 })
    }

    if (auction.status !== "active") {
      return NextResponse.json({ message: "Auction is not active" }, { status: 400 })
    }

    // End the auction
    auction.status = "ended"
    auction.endTime = new Date()

    if (auction.highestBidderId && auction.currentBid > 0) {
      // Player is sold
      auction.status = "sold"

      // Update player
      await Player.findByIdAndUpdate(auction.playerId, {
        status: "sold",
        teamId: auction.highestBidderId,
        currentBid: auction.currentBid,
      })

      // Update team budget and add player
      const team = await Team.findById(auction.highestBidderId)
      if (team) {
        team.budget -= auction.currentBid
        team.players.push(auction.playerId)
        await team.save()
      }
    } else {
      // No bids, player remains available
      await Player.findByIdAndUpdate(auction.playerId, {
        status: "available",
      })
    }

    await auction.save()

    return NextResponse.json({
      message: "Auction ended successfully",
      auction,
    })
  } catch (error) {
    console.error("Error ending auction:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
