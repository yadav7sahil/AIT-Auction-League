import mongoose from "mongoose"

const BidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isWinning: {
    type: Boolean,
    default: false,
  },
})

BidSchema.index({ auctionId: 1, timestamp: -1 })
BidSchema.index({ teamId: 1, timestamp: -1 })

export default mongoose.models.Bid || mongoose.model("Bid", BidSchema)
