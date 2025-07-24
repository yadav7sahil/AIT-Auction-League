import mongoose from "mongoose"

const AuctionSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  currentBid: {
    type: Number,
    default: 0,
  },
  highestBidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  bids: [
    {
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "active", "ended", "sold"],
    default: "pending",
  },
  startTime: {
    type: Date,
    default: null,
  },
  endTime: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number,
    default: 30, // seconds
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

AuctionSchema.pre("save", function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Auction || mongoose.model("Auction", AuctionSchema)
