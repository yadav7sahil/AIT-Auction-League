import mongoose from "mongoose"

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  captainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  budget: {
    type: Number,
    required: true,
    min: 0,
    default: 1000,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

TeamSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Team || mongoose.model("Team", TeamSchema)
