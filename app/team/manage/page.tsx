"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, DollarSign, Users, Star, ArrowLeft, Settings, UserMinus, Crown } from "lucide-react"
import Link from "next/link"

interface Player {
  _id: string
  name: string
  position: string
  rollNo: string
  dept: string
  rating: number
  basePrice: number
  currentBid: number
}

interface Team {
  _id: string
  name: string
  budget: number
  players: Player[]
  captainId: string
}

export default function ManageTeamPage() {
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.role !== "captain") {
      router.push("/dashboard")
      return
    }
    fetchTeam()
  }, [router])

  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/teams/my-team", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTeam(data)
      } else if (response.status === 404) {
        // No team found, redirect to create team
        router.push("/team/create")
      } else {
        setError("Failed to fetch team data")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case "Goalkeeper":
        return "bg-purple-500/20 text-purple-200 border-purple-500/50"
      case "Defender":
        return "bg-blue-500/20 text-blue-200 border-blue-500/50"
      case "Midfielder":
        return "bg-green-500/20 text-green-200 border-green-500/50"
      case "Forward":
        return "bg-red-500/20 text-red-200 border-red-500/50"
      case "Winger":
        return "bg-orange-500/20 text-orange-200 border-orange-500/50"
      default:
        return "bg-gray-500/20 text-gray-200 border-gray-500/50"
    }
  }

  const calculateTotalSpent = () => {
    if (!team) return 0
    return team.players.reduce((total, player) => total + (player.currentBid || player.basePrice), 0)
  }

  const getFormationCounts = () => {
    if (!team) return { goalkeepers: 0, defenders: 0, midfielders: 0, forwards: 0, wingers: 0 }

    return team.players.reduce(
      (counts, player) => {
        switch (player.position) {
          case "Goalkeeper":
            counts.goalkeepers++
            break
          case "Defender":
            counts.defenders++
            break
          case "Midfielder":
            counts.midfielders++
            break
          case "Forward":
            counts.forwards++
            break
          case "Winger":
            counts.wingers++
            break
        }
        return counts
      },
      { goalkeepers: 0, defenders: 0, midfielders: 0, forwards: 0, wingers: 0 },
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading team...</div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">No Team Found</h2>
            <p className="text-gray-300 mb-6">
              You haven't created a team yet. Create one to start participating in auctions.
            </p>
            <Link href="/team/create">
              <Button className="bg-gradient-to-r from-blue-500 to-green-600">Create Team</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formationCounts = getFormationCounts()
  const totalSpent = calculateTotalSpent()

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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                <p className="text-gray-300 text-sm">Team Management</p>
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

        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Budget Remaining</p>
                  <p className="text-2xl font-bold text-green-400">${team.budget.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-red-400">${totalSpent.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Squad Size</p>
                  <p className="text-2xl font-bold text-white">{team.players.length}/11</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {team.players.length > 0
                      ? Math.round(team.players.reduce((sum, p) => sum + p.rating, 0) / team.players.length)
                      : 0}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formation Overview */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Squad Formation</CardTitle>
            <CardDescription className="text-gray-300">Current team composition by position</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-purple-200">{formationCounts.goalkeepers}</span>
                </div>
                <p className="text-purple-200 text-sm">Goalkeepers</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-blue-200">{formationCounts.defenders}</span>
                </div>
                <p className="text-blue-200 text-sm">Defenders</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-green-200">{formationCounts.midfielders}</span>
                </div>
                <p className="text-green-200 text-sm">Midfielders</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-red-200">{formationCounts.forwards}</span>
                </div>
                <p className="text-red-200 text-sm">Forwards</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-orange-200">{formationCounts.wingers}</span>
                </div>
                <p className="text-orange-200 text-sm">Wingers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Squad List */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Squad Players ({team.players.length})</CardTitle>
                <CardDescription className="text-gray-300">Your current team roster</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Team Settings
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {team.players.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {team.players.map((player) => (
                  <div
                    key={player._id}
                    className="p-6 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={`/placeholder.svg?height=64&width=64&query=${player.name.replace(" ", "+")}`}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-lg">
                            {player.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-white text-lg">{player.name}</h3>
                          <p className="text-gray-400">{player.rollNo}</p>
                          <p className="text-gray-500 text-sm">{player.dept}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-400 text-red-400 hover:bg-red-400/20 bg-transparent"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400 text-sm">Position:</span>
                        <Badge className={`${getPositionColor(player.position)} text-xs`}>{player.position}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-400 text-sm">Rating:</span>
                        <span className="text-yellow-400 font-semibold">{player.rating}/100</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400 text-sm">Cost:</span>
                        <span className="text-green-400 font-semibold">
                          ${(player.currentBid || player.basePrice).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-sm">Captain:</span>
                        <span className="text-white font-semibold">No</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Players Yet</h3>
                <p className="text-gray-300 mb-6">Your squad is empty. Participate in auctions to build your team!</p>
                <Link href="/auction">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600">Join Live Auction</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
