import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectDB } from "@/lib/mongodb"
import Team from "@/models/Team"
import User from "@/models/User"

// GET - Fetch all teams
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const teams = await Team.find({})
      .populate("captainId", "name email")
      .populate("players", "name position rating")
      .sort({ createdAt: -1 })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new team
export async function POST(request: NextRequest) {
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
      return NextResponse.json({ message: "Only captains can create teams" }, { status: 403 })
    }

    const { name, budget } = await request.json()

    // Validate input
    if (!name || !budget) {
      return NextResponse.json({ message: "Team name and budget are required" }, { status: 400 })
    }

    if (budget < 500 || budget > 5000) {
      return NextResponse.json({ message: "Budget must be between $500 and $5000" }, { status: 400 })
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name })
    if (existingTeam) {
      return NextResponse.json({ message: "Team name already exists" }, { status: 409 })
    }

    // Check if captain already has a team
    const captainTeam = await Team.findOne({ captainId: decoded.userId })
    if (captainTeam) {
      return NextResponse.json({ message: "You already have a team" }, { status: 409 })
    }

    // Create new team
    const newTeam = new Team({
      name,
      captainId: decoded.userId,
      budget,
      players: [],
      createdAt: new Date(),
    })

    await newTeam.save()
    await newTeam.populate("captainId", "name email")

    return NextResponse.json(
      {
        message: "Team created successfully",
        team: newTeam,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
