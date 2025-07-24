import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Auction from "@/models/Auction"
import Player from "@/models/Player"
import Team from "@/models/Team"

// POST - Auto-end expired auctions (called by cron job or scheduler)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Find all active auctions that have expired
    const expiredAuctions = await Auction.find({
      status: "active",
      endTime: { $lt: new Date() },
    })

    const results = []

    for (const auction of expiredAuctions) {
      try {
        // End the auction
        auction.status = "ended"

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

          results.push({
            auctionId: auction._id,
            playerId: auction.playerId,
            soldTo: auction.highestBidderId,
            finalPrice: auction.currentBid,
            status: "sold",
          })
        } else {
          // No bids, player remains available
          await Player.findByIdAndUpdate(auction.playerId, {
            status: "available",
          })

          results.push({
            auctionId: auction._id,
            playerId: auction.playerId,
            status: "unsold",
          })
        }

        await auction.save()
      } catch (error) {
        console.error(`Error ending auction ${auction._id}:`, error)
        results.push({
          auctionId: auction._id,
          status: "error",
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${expiredAuctions.length} expired auctions`,
      results,
    })
  } catch (error) {
    console.error("Error in auto-end auctions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
