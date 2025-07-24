import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Team from "@/models/Team"
import User from "@/models/User"

// GET - Fetch captain's team
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ message: "Authorization header required" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    // Verify user is a captain
    const user = await User.findById(decoded.userId)
    if (!user || user.role !== "captain") {
      return NextResponse.json({ message: "Only captains can access team data" }, { status: 403 })
    }

    const team = await Team.findOne({ captainId: decoded.userId })
      .populate("players", "name position rollNo dept rating basePrice currentBid")
      .populate("captainId", "name email")

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 })
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
