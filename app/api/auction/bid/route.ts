import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Auction from "@/models/Auction"
import Team from "@/models/Team"
import User from "@/models/User"
import Bid from "@/models/Bid"

// POST - Place a bid
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    // Verify user is captain
    const user = await User.findById(decoded.userId)
    if (!user || user.role !== "captain") {
      return NextResponse.json({ message: "Only captains can place bids" }, { status: 403 })
    }

    const { auctionId, amount } = await request.json()

    // Find captain's team
    const team = await Team.findOne({ captainId: decoded.userId })
    if (!team) {
      return NextResponse.json({ message: "You don't have a team" }, { status: 400 })
    }

    // Find active auction (if auctionId is "current", find the active one)
    let auction
    if (auctionId === "current") {
      auction = await Auction.findOne({ status: "active" })
    } else {
      auction = await Auction.findById(auctionId)
    }

    if (!auction) {
      return NextResponse.json({ message: "Auction not found" }, { status: 404 })
    }

    if (auction.status !== "active") {
      return NextResponse.json({ message: "Auction is not active" }, { status: 400 })
    }

    // Check if auction has ended
    if (new Date() > auction.endTime) {
      return NextResponse.json({ message: "Auction has ended" }, { status: 400 })
    }

    // Validate bid amount
    if (amount <= auction.currentBid) {
      return NextResponse.json({ message: "Bid must be higher than current bid" }, { status: 400 })
    }

    if (amount > team.budget) {
      return NextResponse.json({ message: "Insufficient budget" }, { status: 400 })
    }

    // Create new bid
    const newBid = new Bid({
      auctionId: auction._id,
      teamId: team._id,
      playerId: auction.playerId,
      amount,
      timestamp: new Date(),
      isWinning: true,
    })

    await newBid.save()

    // Mark previous winning bids as not winning
    await Bid.updateMany({ auctionId: auction._id, _id: { $ne: newBid._id } }, { isWinning: false })

    // Update auction with new highest bid
    auction.currentBid = amount
    auction.highestBidderId = team._id
    auction.bids.push({
      teamId: team._id,
      amount,
      timestamp: new Date(),
    })

    await auction.save()

    // Populate the response
    const populatedBid = await Bid.findById(newBid._id).populate("teamId", "name").populate("playerId", "name")

    // Broadcast to WebSocket clients (if WebSocket server is running)
    try {
      const bidData = {
        id: newBid._id.toString(),
        teamName: team.name,
        amount: amount,
        timestamp: new Date(),
        captainName: user.name,
        playerId: auction.playerId.toString(),
      }

      // You would broadcast this to WebSocket clients here
      // This is a simplified version - in production you'd have a proper WebSocket manager
      console.log("Broadcasting bid:", bidData)
    } catch (wsError) {
      console.error("WebSocket broadcast error:", wsError)
      // Don't fail the bid if WebSocket fails
    }

    return NextResponse.json({
      message: "Bid placed successfully",
      bid: populatedBid,
      auction: {
        currentBid: auction.currentBid,
        highestBidderId: auction.highestBidderId,
      },
    })
  } catch (error) {
    console.error("Error placing bid:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
