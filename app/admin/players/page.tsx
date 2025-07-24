"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Search, ArrowLeft, Trash2, Edit, Star, DollarSign, Trophy } from "lucide-react"
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
  teamId?: string
  createdAt: string
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.role !== "admin") {
      router.push("/dashboard")
      return
    }
    fetchPlayers()
  }, [router])

  useEffect(() => {
    filterPlayers()
  }, [players, searchTerm, positionFilter, statusFilter])

  const fetchPlayers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/players", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPlayers(data)
      } else {
        setError("Failed to fetch players")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const filterPlayers = () => {
    let filtered = players

    if (searchTerm) {
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.dept.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (positionFilter !== "all") {
      filtered = filtered.filter((player) => player.position === positionFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((player) => player.status === statusFilter)
    }

    setFilteredPlayers(filtered)
  }

  const deletePlayer = async (playerId: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess("Player deleted successfully")
        fetchPlayers()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to delete player")
      }
    } catch (err) {
      setError("Network error")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-200 border-green-500/50"
      case "bidding":
        return "bg-yellow-500/20 text-yellow-200 border-yellow-500/50"
      case "sold":
        return "bg-red-500/20 text-red-200 border-red-500/50"
      default:
        return "bg-gray-500/20 text-gray-200 border-gray-500/50"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading players...</div>
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Player Management</h1>
                <p className="text-gray-300 text-sm">Manage players and auction settings</p>
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

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search players by name, roll no, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                />
              </div>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="Goalkeeper">Goalkeeper</SelectItem>
                  <SelectItem value="Defender">Defender</SelectItem>
                  <SelectItem value="Midfielder">Midfielder</SelectItem>
                  <SelectItem value="Forward">Forward</SelectItem>
                  <SelectItem value="Winger">Winger</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="bidding">In Auction</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">All Players ({filteredPlayers.length})</CardTitle>
                <CardDescription className="text-gray-300">Manage player profiles and auction status</CardDescription>
              </div>
              <Link href="/admin/players/add">
                <Button className="bg-gradient-to-r from-green-500 to-blue-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPlayers.map((player) => (
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
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-400 text-blue-400 hover:bg-blue-400/20 bg-transparent"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePlayer(player._id)}
                        className="border-red-400 text-red-400 hover:bg-red-400/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
                      <span className="text-gray-400 text-sm">Base Price:</span>
                      <span className="text-green-400 font-semibold">${player.basePrice}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">Status:</span>
                      <Badge className={`${getStatusColor(player.status)} text-xs capitalize`}>{player.status}</Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-gray-500 text-xs">
                      Added {new Date(player.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-400 text-purple-400 hover:bg-purple-400/20 bg-transparent"
                      >
                        Start Auction
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredPlayers.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Players Found</h3>
                  <p className="text-gray-300 mb-6">
                    {searchTerm || positionFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "No players have been added yet"}
                  </p>
                  <Link href="/admin/players/add">
                    <Button className="bg-gradient-to-r from-green-500 to-blue-600">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add First Player
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
