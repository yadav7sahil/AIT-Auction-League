import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import Team from "@/models/Team"
import Player from "@/models/Player"
import Auction from "@/models/Auction"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get counts for dashboard stats
    const [totalUsers, totalTeams, totalPlayers, activeAuctions] = await Promise.all([
      User.countDocuments({}),
      Team.countDocuments({}),
      Player.countDocuments({}),
      Auction.countDocuments({ status: "active" }),
    ])

    return NextResponse.json({
      totalUsers,
      totalTeams,
      totalPlayers,
      activeAuctions,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
