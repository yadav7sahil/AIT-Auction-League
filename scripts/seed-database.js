import mongoose from "mongoose"
import bcrypt from "bcryptjs"

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/football-auction"

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: { type: Date, default: Date.now },
})

// Player Schema
const PlayerSchema = new mongoose.Schema({
  name: String,
  position: String,
  rollNo: String,
  dept: String,
  rating: Number,
  basePrice: Number,
  status: { type: String, default: "available" },
  createdAt: { type: Date, default: Date.now },
})

// Team Schema
const TeamSchema = new mongoose.Schema({
  name: String,
  captainId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  budget: Number,
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.models.User || mongoose.model("User", UserSchema)
const Player = mongoose.models.Player || mongoose.model("Player", PlayerSchema)
const Team = mongoose.models.Team || mongoose.model("Team", TeamSchema)

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    console.log("Clearing existing data...")
    await User.deleteMany({})
    await Player.deleteMany({})
    await Team.deleteMany({})

    // Create admin user
    console.log("Creating admin user...")
    const adminPassword = await bcrypt.hash("admin123", 12)
    const admin = new User({
      name: "Admin User",
      email: "admin@ait.edu",
      password: adminPassword,
      role: "admin",
    })
    await admin.save()

    // Create sample captains
    console.log("Creating sample captains...")
    const captainPassword = await bcrypt.hash("captain123", 12)
    const captains = [
      { name: "John Doe", email: "john@ait.edu", password: captainPassword, role: "captain" },
      { name: "Jane Smith", email: "jane@ait.edu", password: captainPassword, role: "captain" },
      { name: "Mike Johnson", email: "mike@ait.edu", password: captainPassword, role: "captain" },
      { name: "Sarah Wilson", email: "sarah@ait.edu", password: captainPassword, role: "captain" },
    ]

    const createdCaptains = await User.insertMany(captains)

    // Create sample players
    console.log("Creating sample players...")
    const players = [
      // Goalkeepers
      {
        name: "Lionel Messi",
        position: "Forward",
        rollNo: "21CS001",
        dept: "Computer Science",
        rating: 95,
        basePrice: 200,
      },
      {
        name: "Cristiano Ronaldo",
        position: "Forward",
        rollNo: "21CS002",
        dept: "Computer Science",
        rating: 94,
        basePrice: 190,
      },
      {
        name: "Neymar Jr",
        position: "Winger",
        rollNo: "21IT001",
        dept: "Information Technology",
        rating: 91,
        basePrice: 170,
      },
      {
        name: "Kylian Mbappé",
        position: "Forward",
        rollNo: "21IT002",
        dept: "Information Technology",
        rating: 93,
        basePrice: 180,
      },
      {
        name: "Kevin De Bruyne",
        position: "Midfielder",
        rollNo: "21EC001",
        dept: "Electronics & Communication",
        rating: 92,
        basePrice: 160,
      },

      // Defenders
      {
        name: "Virgil van Dijk",
        position: "Defender",
        rollNo: "21ME001",
        dept: "Mechanical Engineering",
        rating: 90,
        basePrice: 150,
      },
      {
        name: "Sergio Ramos",
        position: "Defender",
        rollNo: "21ME002",
        dept: "Mechanical Engineering",
        rating: 89,
        basePrice: 140,
      },
      {
        name: "Marcelo Silva",
        position: "Defender",
        rollNo: "21CE001",
        dept: "Civil Engineering",
        rating: 85,
        basePrice: 120,
      },
      {
        name: "João Cancelo",
        position: "Defender",
        rollNo: "21CE002",
        dept: "Civil Engineering",
        rating: 87,
        basePrice: 130,
      },

      // Midfielders
      {
        name: "Luka Modrić",
        position: "Midfielder",
        rollNo: "21EE001",
        dept: "Electrical Engineering",
        rating: 88,
        basePrice: 135,
      },
      {
        name: "N'Golo Kanté",
        position: "Midfielder",
        rollNo: "21EE002",
        dept: "Electrical Engineering",
        rating: 86,
        basePrice: 125,
      },
      {
        name: "Bruno Fernandes",
        position: "Midfielder",
        rollNo: "21CH001",
        dept: "Chemical Engineering",
        rating: 84,
        basePrice: 115,
      },
      {
        name: "Pedri González",
        position: "Midfielder",
        rollNo: "21CH002",
        dept: "Chemical Engineering",
        rating: 82,
        basePrice: 110,
      },

      // Goalkeepers
      {
        name: "Alisson Becker",
        position: "Goalkeeper",
        rollNo: "21BT001",
        dept: "Biotechnology",
        rating: 89,
        basePrice: 140,
      },
      {
        name: "Manuel Neuer",
        position: "Goalkeeper",
        rollNo: "21BT002",
        dept: "Biotechnology",
        rating: 88,
        basePrice: 135,
      },

      // More players
      { name: "Mohamed Salah", position: "Winger", rollNo: "21MBA001", dept: "MBA", rating: 90, basePrice: 155 },
      { name: "Sadio Mané", position: "Winger", rollNo: "21MBA002", dept: "MBA", rating: 87, basePrice: 130 },
      { name: "Robert Lewandowski", position: "Forward", rollNo: "21MCA001", dept: "MCA", rating: 91, basePrice: 165 },
      { name: "Erling Haaland", position: "Forward", rollNo: "21MCA002", dept: "MCA", rating: 89, basePrice: 145 },
      {
        name: "Raheem Sterling",
        position: "Winger",
        rollNo: "21CS003",
        dept: "Computer Science",
        rating: 85,
        basePrice: 120,
      },
    ]

    const createdPlayers = await Player.insertMany(players)

    // Create sample teams
    console.log("Creating sample teams...")
    const teams = [
      { name: "Barcelona FC", captainId: createdCaptains[0]._id, budget: 1000, players: [] },
      { name: "Real Madrid", captainId: createdCaptains[1]._id, budget: 1000, players: [] },
      { name: "Manchester United", captainId: createdCaptains[2]._id, budget: 1000, players: [] },
      { name: "Liverpool FC", captainId: createdCaptains[3]._id, budget: 1000, players: [] },
    ]

    await Team.insertMany(teams)

    console.log("Database seeded successfully!")
    console.log("\n=== LOGIN CREDENTIALS ===")
    console.log("Admin: admin@ait.edu / admin123")
    console.log("Captain 1: john@ait.edu / captain123")
    console.log("Captain 2: jane@ait.edu / captain123")
    console.log("Captain 3: mike@ait.edu / captain123")
    console.log("Captain 4: sarah@ait.edu / captain123")
    console.log("========================\n")

    console.log(`Created ${createdCaptains.length} captains`)
    console.log(`Created ${createdPlayers.length} players`)
    console.log(`Created ${teams.length} teams`)
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

// Run the seeding function
seedDatabase()
