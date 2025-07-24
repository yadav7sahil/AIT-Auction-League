import mongoose from "mongoose"

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    enum: ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger"],
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  dept: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 50,
  },
  basePrice: {
    type: Number,
    required: true,
    min: 10,
    default: 50,
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["available", "bidding", "sold"],
    default: "available",
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

PlayerSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Player || mongoose.model("Player", PlayerSchema)
