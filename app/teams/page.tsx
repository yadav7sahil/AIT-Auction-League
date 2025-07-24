"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, DollarSign, Star, Search, Crown, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Player {
  _id: string
  name: string
  position: string
  rating: number
  currentBid?: number
  basePrice: number
}

interface Team {
  _id: string
  name: string
  captainId: {
    name: string
    email: string
  }
  budget: number
  players: Player[]
  createdAt: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    filterAndSortTeams()
  }, [teams, searchTerm, sortBy])

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams/public")

      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      } else {
        setError("Failed to fetch teams")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortTeams = () => {
    let filtered = teams

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (team) =>
          team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.captainId.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Sort teams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "players":
          return b.players.length - a.players.length
        case "budget":
          return b.budget - a.budget
        case "value":
          const aValue = a.players.reduce((sum, p) => sum + (p.currentBid || p.basePrice), 0)
          const bValue = b.players.reduce((sum, p) => sum + (p.currentBid || p.basePrice), 0)
          return bValue - aValue
        case "rating":
          const aRating = a.players.length > 0 ? a.players.reduce((sum, p) => sum + p.rating, 0) / a.players.length : 0
          const bRating = b.players.length > 0 ? b.players.reduce((sum, p) => sum + p.rating, 0) / b.players.length : 0
          return bRating - aRating
        default:
          return 0
      }
    })

    setFilteredTeams(filtered)
  }

  const calculateTeamValue = (players: Player[]) => {
    return players.reduce((total, player) => total + (player.currentBid || player.basePrice), 0)
  }

  const calculateAverageRating = (players: Player[]) => {
    if (players.length === 0) return 0
    return Math.round(players.reduce((sum, player) => sum + player.rating, 0) / players.length)
  }

  const getPositionCounts = (players: Player[]) => {
    return players.reduce(
      (counts, player) => {
        counts[player.position] = (counts[player.position] || 0) + 1
        return counts
      },
      {} as Record<string, number>,
    )
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading teams...</div>
      </div>
    )
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">All Teams</h1>
                <p className="text-gray-300 text-sm">League standings and team overview</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search teams or captains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Team Name</SelectItem>
                  <SelectItem value="players">Squad Size</SelectItem>
                  <SelectItem value="budget">Budget Remaining</SelectItem>
                  <SelectItem value="value">Team Value</SelectItem>
                  <SelectItem value="rating">Average Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* League Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Teams</p>
                  <p className="text-2xl font-bold text-white">{teams.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Players</p>
                  <p className="text-2xl font-bold text-white">
                    {teams.reduce((sum, team) => sum + team.players.length, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Budget</p>
                  <p className="text-2xl font-bold text-white">
                    ${teams.reduce((sum, team) => sum + team.budget, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Avg Team Value</p>
                  <p className="text-2xl font-bold text-white">
                    $
                    {teams.length > 0
                      ? Math.round(
                          teams.reduce((sum, team) => sum + calculateTeamValue(team.players), 0) / teams.length,
                        ).toLocaleString()
                      : 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTeams.map((team, index) => {
            const teamValue = calculateTeamValue(team.players)
            const avgRating = calculateAverageRating(team.players)
            const positionCounts = getPositionCounts(team.players)

            return (
              <Card
                key={team._id}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:border-white/30 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-yellow-900" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl">{team.name}</CardTitle>
                        <CardDescription className="text-gray-300">Captain: {team.captainId.name}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-400 text-blue-400">
                      #{index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Team Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 text-sm">Squad:</span>
                      <span className="text-white font-semibold">{team.players.length}/11</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-400 text-sm">Avg Rating:</span>
                      <span className="text-yellow-400 font-semibold">{avgRating}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400 text-sm">Budget:</span>
                      <span className="text-green-400 font-semibold">${team.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400 text-sm">Value:</span>
                      <span className="text-purple-400 font-semibold">${teamValue.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Formation */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">Formation</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(positionCounts).map(([position, count]) => (
                        <Badge key={position} className={`${getPositionColor(position)} text-xs`}>
                          {position}: {count}
                        </Badge>
                      ))}
                      {team.players.length === 0 && <span className="text-gray-400 text-sm">No players yet</span>}
                    </div>
                  </div>

                  {/* Top Players */}
                  {team.players.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">Top Players</h4>
                      <div className="space-y-2">
                        {team.players
                          .sort((a, b) => b.rating - a.rating)
                          .slice(0, 3)
                          .map((player) => (
                            <div key={player._id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage
                                    src={`/placeholder.svg?height=32&width=32&query=${player.name.replace(" ", "+")}`}
                                  />
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-xs">
                                    {player.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-white text-sm font-medium">{player.name}</p>
                                  <p className="text-gray-400 text-xs">{player.position}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-yellow-400 text-sm font-semibold">{player.rating}</p>
                                <p className="text-green-400 text-xs">
                                  ${(player.currentBid || player.basePrice).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Team Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400/20 bg-transparent"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-400 text-green-400 hover:bg-green-400/20 bg-transparent"
                    >
                      Compare
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTeams.length === 0 && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Teams Found</h3>
              <p className="text-gray-300">
                {searchTerm ? "Try adjusting your search criteria" : "No teams have been created yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
