import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Auction from "@/models/Auction"
import Bid from "@/models/Bid"

// GET - Get current active auction with real-time data
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const activeAuction = await Auction.findOne({ status: "active" })
      .populate("playerId", "name position rollNo dept rating basePrice")
      .populate("highestBidderId", "name")

    if (!activeAuction) {
      return NextResponse.json({ message: "No active auction" }, { status: 404 })
    }

    // Get recent bids for this auction
    const recentBids = await Bid.find({ auctionId: activeAuction._id })
      .populate("teamId", "name")
      .sort({ timestamp: -1 })
      .limit(10)

    // Calculate time left
    const now = new Date()
    const timeLeft = Math.max(0, Math.floor((activeAuction.endTime.getTime() - now.getTime()) / 1000))

    // Format bids for frontend
    const formattedBids = recentBids.map((bid) => ({
      id: bid._id.toString(),
      teamName: bid.teamId.name,
      amount: bid.amount,
      timestamp: bid.timestamp,
      captainName: "Captain", // You might want to populate this
      playerId: bid.playerId.toString(),
    }))

    return NextResponse.json({
      player: {
        id: activeAuction.playerId._id.toString(),
        name: activeAuction.playerId.name,
        position: activeAuction.playerId.position,
        rollNo: activeAuction.playerId.rollNo,
        dept: activeAuction.playerId.dept,
        rating: activeAuction.playerId.rating,
        basePrice: activeAuction.playerId.basePrice,
        currentBid: activeAuction.currentBid,
        status: "bidding",
      },
      bids: formattedBids,
      timeLeft,
      isActive: timeLeft > 0,
      auctionId: activeAuction._id.toString(),
    })
  } catch (error) {
    console.error("Error fetching current auction:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
