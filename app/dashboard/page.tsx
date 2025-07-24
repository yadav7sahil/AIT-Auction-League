"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  Gavel,
  Settings,
  UserPlus,
  Play,
  Eye,
  BarChart3,
  Shield,
  LogOut,
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalTeams: number
  totalPlayers: number
  totalBudget: number
  activeAuctions: number
}

interface RecentActivity {
  id: string
  type: string
  message: string
  timestamp: Date
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalTeams: 0,
    totalPlayers: 0,
    totalBudget: 0,
    activeAuctions: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (!userData || !token) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }

      // Mock recent activity
      setRecentActivity([
        {
          id: "1",
          type: "auction",
          message: "New auction started for Lionel Messi",
          timestamp: new Date(Date.now() - 300000),
        },
        {
          id: "2",
          type: "bid",
          message: "Barcelona FC placed a bid of $150",
          timestamp: new Date(Date.now() - 600000),
        },
        {
          id: "3",
          type: "team",
          message: "Real Madrid created their team",
          timestamp: new Date(Date.now() - 900000),
        },
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    )
  }

  const getQuickActions = () => {
    switch (user?.role) {
      case "admin":
        return [
          { icon: UserPlus, label: "Add Players", href: "/admin/players/add", color: "from-green-500 to-blue-600" },
          { icon: Play, label: "Start Auction", href: "/admin/auction", color: "from-purple-500 to-pink-600" },
          { icon: Users, label: "Manage Users", href: "/admin/users", color: "from-orange-500 to-red-600" },
          { icon: Settings, label: "Manage Players", href: "/admin/players", color: "from-teal-500 to-cyan-600" },
        ]
      case "captain":
        return [
          { icon: Users, label: "My Team", href: "/team/manage", color: "from-green-500 to-blue-600" },
          { icon: Gavel, label: "Live Auction", href: "/auction", color: "from-purple-500 to-pink-600" },
          { icon: Trophy, label: "All Teams", href: "/teams", color: "from-orange-500 to-red-600" },
          { icon: BarChart3, label: "Statistics", href: "/stats", color: "from-teal-500 to-cyan-600" },
        ]
      default:
        return [
          { icon: Eye, label: "View Auction", href: "/auction", color: "from-green-500 to-blue-600" },
          { icon: Trophy, label: "All Teams", href: "/teams", color: "from-purple-500 to-pink-600" },
          { icon: BarChart3, label: "Statistics", href: "/stats", color: "from-orange-500 to-red-600" },
        ]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AIT Football Auction</h1>
                <p className="text-gray-300 text-sm">Welcome back, {user?.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge
                variant="outline"
                className={`${
                  user?.role === "admin"
                    ? "border-red-400 text-red-400"
                    : user?.role === "captain"
                      ? "border-blue-400 text-blue-400"
                      : "border-gray-400 text-gray-400"
                }`}
              >
                {user?.role === "admin" ? (
                  <Shield className="w-3 h-3 mr-1" />
                ) : user?.role === "captain" ? (
                  <Users className="w-3 h-3 mr-1" />
                ) : (
                  <Eye className="w-3 h-3 mr-1" />
                )}
                {user?.role?.toUpperCase()}
              </Badge>

              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Total Teams</p>
                  <p className="text-3xl font-bold text-white">{stats.totalTeams}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Total Players</p>
                  <p className="text-3xl font-bold text-white">{stats.totalPlayers}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Total Budget</p>
                  <p className="text-3xl font-bold text-white">${stats.totalBudget}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm font-medium">Active Auctions</p>
                  <p className="text-3xl font-bold text-white">{stats.activeAuctions}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Gavel className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-300">
                  {user?.role === "admin"
                    ? "Manage the auction system"
                    : user?.role === "captain"
                      ? "Manage your team and participate in auctions"
                      : "View auctions and team information"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getQuickActions().map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
                            >
                              <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                                {action.label}
                              </h3>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-gray-300">Latest auction updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === "auction"
                            ? "bg-purple-400"
                            : activity.type === "bid"
                              ? "bg-green-400"
                              : "bg-blue-400"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.message}</p>
                        <p className="text-gray-400 text-xs">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Link href="/auction">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90">
                      <Gavel className="w-4 h-4 mr-2" />
                      View Live Auction
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Role-specific sections */}
        {user?.role === "admin" && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-8">
            <CardHeader>
              <CardTitle className="text-white">Admin Controls</CardTitle>
              <CardDescription className="text-gray-300">System administration and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/users">
                  <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors">
                    <Shield className="w-8 h-8 text-red-400 mb-2" />
                    <h3 className="font-semibold text-white">User Management</h3>
                    <p className="text-gray-300 text-sm">Manage user roles and permissions</p>
                  </div>
                </Link>

                <Link href="/admin/players">
                  <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                    <Users className="w-8 h-8 text-blue-400 mb-2" />
                    <h3 className="font-semibold text-white">Player Database</h3>
                    <p className="text-gray-300 text-sm">Add and manage player information</p>
                  </div>
                </Link>

                <Link href="/admin/auction">
                  <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                    <Gavel className="w-8 h-8 text-purple-400 mb-2" />
                    <h3 className="font-semibold text-white">Auction Control</h3>
                    <p className="text-gray-300 text-sm">Start and manage live auctions</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role === "captain" && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-8">
            <CardHeader>
              <CardTitle className="text-white">Team Captain Dashboard</CardTitle>
              <CardDescription className="text-gray-300">Manage your team and participate in auctions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Team Status</h3>
                  <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-200">Budget Remaining</span>
                      <span className="text-green-400 font-bold">$800</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-200">Players Acquired</span>
                      <span className="text-green-400 font-bold">3/11</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Next Actions</h3>
                  <div className="space-y-2">
                    <Link href="/team/manage">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-blue-400 text-blue-400 bg-transparent"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        View Team Details
                      </Button>
                    </Link>
                    <Link href="/auction">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-purple-400 text-purple-400 bg-transparent"
                      >
                        <Gavel className="w-4 h-4 mr-2" />
                        Join Live Auction
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
