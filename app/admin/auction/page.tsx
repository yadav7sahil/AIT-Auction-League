"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Gavel, Play, Square, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

interface Player {
  _id: string
  name: string
  position: string
  rollNo: string
  dept: string
  rating: number
  basePrice: number
  status: string
}

interface ActiveAuction {
  _id: string
  playerId: {
    name: string
    position: string
    rating: number
  }
  currentBid: number
  timeLeft: number
  status: string
}

export default function AdminAuctionPage() {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [activeAuction, setActiveAuction] = useState<ActiveAuction | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState("")
  const [duration, setDuration] = useState("30")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.role !== "admin") {
      router.push("/dashboard")
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
      }

      // Fetch available players
      const playersRes = await fetch("/api/admin/players", { headers })
      if (playersRes.ok) {
        const players = await playersRes.json()
        setAvailablePlayers(players.filter((p: Player) => p.status === "available"))
      }

      // Check for active auction
      const auctionRes = await fetch("/api/auction/current", { headers })
      if (auctionRes.ok) {
        const auction = await auctionRes.json()
        setActiveAuction(auction)
      }
    } catch (err) {
      setError("Failed to fetch data")
    }
  }

  const startAuction = async () => {
    if (!selectedPlayer) {
      setError("Please select a player")
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/auction/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playerId: selectedPlayer,
          duration: Number.parseInt(duration),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess("Auction started successfully!")
        setSelectedPlayer("")
        fetchData() // Refresh data
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to start auction")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const endAuction = async () => {
    if (!activeAuction) return

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/auction/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          auctionId: activeAuction._id,
        }),
      })

      if (response.ok) {
        setSuccess("Auction ended successfully!")
        setActiveAuction(null)
        fetchData() // Refresh data
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to end auction")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Gavel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Auction Control</h1>
                <p className="text-gray-300 text-sm">Start and manage live auctions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        {error && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/50 text-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-500/20 border-green-500/50 text-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Auction Status */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Current Auction Status</CardTitle>
              <CardDescription className="text-gray-300">Live auction information</CardDescription>
            </CardHeader>
            <CardContent>
              {activeAuction ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-200 font-semibold">LIVE AUCTION</span>
                    </div>
                    <h3 className="text-white text-xl font-bold">{activeAuction.playerId.name}</h3>
                    <p className="text-gray-300">
                      {activeAuction.playerId.position} • Rating: {activeAuction.playerId.rating}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-400 text-sm">Current Bid</p>
                      <p className="text-2xl font-bold text-green-400">${activeAuction.currentBid}</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-400 text-sm">Time Left</p>
                      <p className="text-2xl font-bold text-orange-400">{activeAuction.timeLeft}s</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link href="/auction" className="flex-1">
                      <Button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-500/30">
                        <Users className="w-4 h-4 mr-2" />
                        View Live
                      </Button>
                    </Link>
                    <Button
                      onClick={endAuction}
                      disabled={loading}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/30"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      End Auction
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Auction</h3>
                  <p className="text-gray-300">Start a new auction to begin bidding</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Start New Auction */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Start New Auction</CardTitle>
              <CardDescription className="text-gray-300">Select a player and start bidding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-white font-medium">Select Player</label>
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer} disabled={!!activeAuction}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Choose a player for auction" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlayers.map((player) => (
                      <SelectItem key={player._id} value={player._id}>
                        {player.name} - {player.position} (${player.basePrice})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availablePlayers.length === 0 && (
                  <p className="text-gray-400 text-sm">No available players. Add players first.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium">Auction Duration</label>
                <Select value={duration} onValueChange={setDuration} disabled={!!activeAuction}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedPlayer && (
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <h4 className="text-blue-200 font-semibold mb-2">Selected Player Preview</h4>
                  {(() => {
                    const player = availablePlayers.find((p) => p._id === selectedPlayer)
                    return player ? (
                      <div className="space-y-1 text-sm">
                        <p className="text-white">
                          <strong>{player.name}</strong>
                        </p>
                        <p className="text-gray-300">
                          {player.position} • {player.rollNo}
                        </p>
                        <p className="text-gray-300">{player.dept}</p>
                        <p className="text-yellow-400">Rating: {player.rating}/100</p>
                        <p className="text-green-400">Base Price: ${player.basePrice}</p>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              <Button
                onClick={startAuction}
                disabled={loading || !selectedPlayer || !!activeAuction}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90 text-white font-semibold py-3"
              >
                {loading ? (
                  "Starting..."
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Auction
                  </>
                )}
              </Button>

              {activeAuction && (
                <p className="text-center text-gray-400 text-sm">End the current auction before starting a new one</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Players */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Available Players ({availablePlayers.length})</CardTitle>
            <CardDescription className="text-gray-300">Players ready for auction</CardDescription>
          </CardHeader>
          <CardContent>
            {availablePlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePlayers.map((player) => (
                  <div
                    key={player._id}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedPlayer === player._id
                        ? "bg-blue-500/20 border-blue-500/50"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <h4 className="font-semibold text-white">{player.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {player.position} • {player.rollNo}
                    </p>
                    <p className="text-gray-500 text-xs">{player.dept}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-yellow-400 text-sm">⭐ {player.rating}</span>
                      <span className="text-green-400 font-semibold">${player.basePrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Available Players</h3>
                <p className="text-gray-300 mb-4">Add players to start auctions</p>
                <Link href="/admin/players/add">
                  <Button className="bg-gradient-to-r from-green-500 to-blue-600">Add Players</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
