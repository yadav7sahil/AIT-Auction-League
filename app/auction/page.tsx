"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Gavel, Timer, DollarSign, Users, TrendingUp, Crown, AlertCircle, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWebSocket } from "@/hooks/useWebSocket"

interface Player {
  id: string
  name: string
  position: string
  rollNo: string
  dept: string
  rating: number
  basePrice: number
  currentBid: number
  status: "available" | "bidding" | "sold"
  image?: string
}

interface Bid {
  id: string
  teamName: string
  amount: number
  timestamp: Date
  captainName: string
  playerId: string
}

interface Team {
  id: string
  name: string
  budget: number
  captainName: string
}

export default function AuctionPage() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [bidAmount, setBidAmount] = useState("")
  const [timeLeft, setTimeLeft] = useState(30)
  const [isActive, setIsActive] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userTeam, setUserTeam] = useState<Team | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mock data for demonstration
  const mockPlayer: Player = {
    id: "1",
    name: "Lionel Messi",
    position: "Forward",
    rollNo: "21CS001",
    dept: "Computer Science",
    rating: 95,
    basePrice: 100,
    currentBid: 150,
    status: "bidding",
  }

  const mockBids: Bid[] = [
    {
      id: "1",
      teamName: "Barcelona FC",
      amount: 150,
      timestamp: new Date(),
      captainName: "John Doe",
      playerId: "1",
    },
    {
      id: "2",
      teamName: "Real Madrid",
      amount: 140,
      timestamp: new Date(Date.now() - 30000),
      captainName: "Jane Smith",
      playerId: "1",
    },
    {
      id: "3",
      teamName: "Manchester United",
      amount: 130,
      timestamp: new Date(Date.now() - 60000),
      captainName: "Mike Johnson",
      playerId: "1",
    },
  ]

  const { isConnected: wsConnected, sendMessage } = useWebSocket(
    typeof window !== "undefined"
      ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`
      : "ws://localhost:8080",
    {
      onMessage: (data) => {
        switch (data.type) {
          case "new_bid":
            setBids((prev) => [data.data, ...prev])
            if (currentPlayer && data.data.playerId === currentPlayer.id) {
              setCurrentPlayer((prev) => (prev ? { ...prev, currentBid: data.data.amount } : null))
            }
            // Reset timer on new bid
            setTimeLeft(30)
            break
          case "auction_update":
            setCurrentPlayer(data.data.player)
            setTimeLeft(data.data.timeLeft)
            setIsActive(data.data.isActive)
            break
          case "auction_ended":
            setIsActive(false)
            if (currentPlayer) {
              setCurrentPlayer({ ...currentPlayer, status: "sold" })
            }
            break
        }
      },
    },
  )

  const fetchCurrentAuction = async () => {
    try {
      const response = await fetch("/api/auction/current")
      if (response.ok) {
        const data = await response.json()
        setCurrentPlayer(data.player)
        setBids(data.bids || [])
        setTimeLeft(data.timeLeft || 30)
        setIsActive(data.isActive || false)
      } else {
        // Use mock data if no active auction
        setCurrentPlayer(mockPlayer)
        setBids(mockBids)
        setIsActive(true)
      }
    } catch (error) {
      console.error("Error fetching auction:", error)
      // Fallback to mock data
      setCurrentPlayer(mockPlayer)
      setBids(mockBids)
      setIsActive(true)
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Fetch current auction data
    fetchCurrentAuction()

    // Mock user team - in production this would come from API
    setUserTeam({
      id: "team1",
      name: "My Team",
      budget: 800,
      captainName: "Current User",
    })

    // Start countdown timer
    startTimer()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false)
          if (currentPlayer) {
            setCurrentPlayer({ ...currentPlayer, status: "sold" })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleBid = async () => {
    if (!bidAmount || !currentPlayer || !userTeam) return

    const amount = Number.parseInt(bidAmount)

    if (amount <= currentPlayer.currentBid) {
      setError("Bid must be higher than current bid")
      return
    }

    if (amount > userTeam.budget) {
      setError("Insufficient budget")
      return
    }

    if (user?.role !== "captain") {
      setError("Only captains can place bids")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auction/bid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          auctionId: "current", // This would be the actual auction ID
          amount: amount,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Send WebSocket message for real-time updates
        sendMessage({
          type: "place_bid",
          bid: {
            id: Date.now().toString(),
            teamName: userTeam.name,
            amount: amount,
            timestamp: new Date(),
            captainName: user.name,
            playerId: currentPlayer.id,
          },
        })

        setBidAmount("")
        setSuccess(`Bid placed successfully: $${amount}`)
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to place bid")
      }
    } catch (err) {
      setError("Failed to place bid")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getProgressColor = () => {
    if (timeLeft > 20) return "bg-green-500"
    if (timeLeft > 10) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-10"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Gavel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Live Auction</h1>
                <p className="text-gray-300 text-sm">Real-time player bidding</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${wsConnected ? "bg-green-400" : "bg-red-400"}`}></div>
              <span className="text-sm text-gray-300">{wsConnected ? "Live" : "Offline"}</span>
              {userTeam && (
                <div className="text-right">
                  <div className="text-white font-semibold">{userTeam.name}</div>
                  <div className="text-green-400 text-sm">Budget: ${userTeam.budget}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        {error && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/50 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-500/20 border-green-500/50 text-green-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Player */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Current Player
                  </CardTitle>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={isActive ? "bg-green-500" : "bg-gray-500"}
                  >
                    {isActive ? "LIVE" : "ENDED"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentPlayer ? (
                  <div className="space-y-6">
                    {/* Player Info */}
                    <div className="flex items-center space-x-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" />
                        <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600">
                          {currentPlayer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white mb-2">{currentPlayer.name}</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Position:</span>
                            <span className="text-white ml-2 font-semibold">{currentPlayer.position}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Roll No:</span>
                            <span className="text-white ml-2 font-semibold">{currentPlayer.rollNo}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Department:</span>
                            <span className="text-white ml-2 font-semibold">{currentPlayer.dept}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Rating:</span>
                            <span className="text-yellow-400 ml-2 font-semibold">{currentPlayer.rating}/100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bidding Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4 text-center">
                          <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <div className="text-gray-400 text-sm">Base Price</div>
                          <div className="text-2xl font-bold text-white">${currentPlayer.basePrice}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                          <div className="text-gray-400 text-sm">Current Bid</div>
                          <div className="text-3xl font-bold text-green-400">${currentPlayer.currentBid}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4 text-center">
                          <Timer className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                          <div className="text-gray-400 text-sm">Time Left</div>
                          <div className={`text-3xl font-bold ${timeLeft <= 10 ? "text-red-400" : "text-white"}`}>
                            {formatTime(timeLeft)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Timer Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Auction Progress</span>
                        <span className="text-gray-400">{Math.round(((30 - timeLeft) / 30) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor()}`}
                          style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Bidding Controls */}
                    {user?.role === "captain" && isActive && (
                      <div className="flex space-x-4">
                        <Input
                          type="number"
                          placeholder="Enter bid amount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          min={currentPlayer.currentBid + 1}
                        />
                        <Button
                          onClick={handleBid}
                          disabled={loading || !bidAmount}
                          className="bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90 px-8"
                        >
                          {loading ? "Placing..." : "Place Bid"}
                        </Button>
                      </div>
                    )}

                    {user?.role === "viewer" && (
                      <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                        <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-blue-200">You're viewing as a guest. Only captains can place bids.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Auction</h3>
                    <p className="text-gray-300">Waiting for the next player to be put up for auction...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bid History */}
          <div>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Live Bids
                </CardTitle>
                <CardDescription className="text-gray-300">Real-time bidding activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`p-3 rounded-lg border ${
                        index === 0 ? "bg-green-500/20 border-green-500/50 animate-pulse" : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                          <span className="font-semibold text-white">{bid.teamName}</span>
                        </div>
                        <span className="text-green-400 font-bold">${bid.amount}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>{bid.captainName}</span>
                        <span>{new Date(bid.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}

                  {bids.length === 0 && (
                    <div className="text-center py-8">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">No bids yet</p>
                      <p className="text-gray-500 text-sm">Be the first to place a bid!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Bid Buttons */}
            {user?.role === "captain" && isActive && currentPlayer && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-6">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Bids</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[10, 25, 50, 100].map((increment) => {
                      const quickBidAmount = currentPlayer.currentBid + increment
                      const canAfford = userTeam && quickBidAmount <= userTeam.budget

                      return (
                        <Button
                          key={increment}
                          onClick={() => setBidAmount(quickBidAmount.toString())}
                          disabled={!canAfford}
                          variant="outline"
                          className={`${
                            canAfford
                              ? "border-blue-400 text-blue-400 hover:bg-blue-400/20"
                              : "border-gray-600 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          +${increment}
                          <br />
                          <span className="text-xs">${quickBidAmount}</span>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Upcoming Players */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Upcoming Players</CardTitle>
            <CardDescription className="text-gray-300">Next players in the auction queue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Cristiano Ronaldo", position: "Forward", basePrice: 120, rating: 94 },
                { name: "Neymar Jr", position: "Winger", basePrice: 110, rating: 91 },
                { name: "Kylian Mbappé", position: "Forward", basePrice: 115, rating: 93 },
              ].map((player, index) => (
                <Card key={index} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar>
                        <AvatarImage
                          src={`/placeholder.svg?height=40&width=40&query=${player.name.replace(" ", "+")}`}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600">
                          {player.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-white">{player.name}</h4>
                        <p className="text-sm text-gray-400">{player.position}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Base Price:</span>
                      <span className="text-green-400 font-semibold">${player.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rating:</span>
                      <span className="text-yellow-400 font-semibold">{player.rating}/100</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
