"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, DollarSign, Users, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState("")
  const [budget, setBudget] = useState("1000")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/login")
      return
    }

    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (parsedUser.role !== "captain") {
        setError("Only captains can create teams")
      }
    }
  }, [router])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!teamName.trim()) {
      setError("Team name is required")
      setLoading(false)
      return
    }

    if (Number.parseInt(budget) < 500) {
      setError("Minimum budget is $500")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: teamName,
          budget: Number.parseInt(budget),
          captainId: user?.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Team created successfully!")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(data.message || "Failed to create team")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== "captain") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-300 mb-6">
              Only captains can create teams. Please contact an admin to upgrade your role.
            </p>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
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
                <h1 className="text-2xl font-bold text-white">Create Team</h1>
                <p className="text-gray-300 text-sm">Build your championship squad</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">Create Your Team</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Set up your team to participate in player auctions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/20 border-green-500/50 text-green-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateTeam} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-white text-lg">
                    Team Name
                  </Label>
                  <Input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 text-lg py-3"
                    placeholder="Enter your team name (e.g., Barcelona FC)"
                    required
                  />
                  <p className="text-gray-400 text-sm">Choose a unique and memorable name for your team</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-white text-lg">
                    Starting Budget
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="budget"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 text-lg py-3 pl-12"
                      placeholder="1000"
                      min="500"
                      max="5000"
                      required
                    />
                  </div>
                  <p className="text-gray-400 text-sm">
                    Set your team's budget for player auctions (Min: $500, Max: $5000)
                  </p>
                </div>

                {/* Team Preview */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Team Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Trophy className="w-8 h-8 text-blue-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Team Name</p>
                          <p className="text-white font-semibold">{teamName || "Your Team Name"}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-8 h-8 text-green-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Starting Budget</p>
                          <p className="text-green-400 font-semibold">
                            ${Number.parseInt(budget || "0").toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Users className="w-8 h-8 text-purple-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Captain</p>
                          <p className="text-white font-semibold">{user?.name || "You"}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Trophy className="w-8 h-8 text-orange-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Players</p>
                          <p className="text-white font-semibold">0 / 11</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Guidelines */}
                <Card className="bg-blue-500/20 border-blue-500/30">
                  <CardContent className="p-4">
                    <h4 className="text-blue-200 font-semibold mb-3">Team Creation Guidelines</h4>
                    <ul className="space-y-2 text-blue-200 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Each captain can create only one team</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Team names must be unique across the platform</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Budget will be used to bid on players during auctions</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>You can build a squad of up to 11 players</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="flex space-x-4">
                  <Link href="/dashboard" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 py-3 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading || !teamName.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-green-600 hover:opacity-90 text-white font-semibold py-3 transition-all duration-300 shadow-lg"
                  >
                    {loading ? "Creating Team..." : "Create Team"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
