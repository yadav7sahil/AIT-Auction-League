// Auction auto-end scheduler utility
export class AuctionScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  scheduleAuctionEnd(auctionId: string, endTime: Date) {
    const now = new Date()
    const timeUntilEnd = endTime.getTime() - now.getTime()

    if (timeUntilEnd <= 0) {
      // Auction should have already ended
      this.endAuction(auctionId)
      return
    }

    // Schedule the auction to end
    const timeout = setTimeout(() => {
      this.endAuction(auctionId)
      this.intervals.delete(auctionId)
    }, timeUntilEnd)

    this.intervals.set(auctionId, timeout)
  }

  private async endAuction(auctionId: string) {
    try {
      const response = await fetch("/api/auction/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ auctionId }),
      })

      if (response.ok) {
        console.log(`Auction ${auctionId} ended automatically`)
      } else {
        console.error(`Failed to end auction ${auctionId}`)
      }
    } catch (error) {
      console.error(`Error ending auction ${auctionId}:`, error)
    }
  }

  cancelScheduledEnd(auctionId: string) {
    const timeout = this.intervals.get(auctionId)
    if (timeout) {
      clearTimeout(timeout)
      this.intervals.delete(auctionId)
    }
  }

  // Clean up all scheduled timeouts
  cleanup() {
    for (const [auctionId, timeout] of this.intervals) {
      clearTimeout(timeout)
    }
    this.intervals.clear()
  }
}

// Global scheduler instance
export const auctionScheduler = new AuctionScheduler()
