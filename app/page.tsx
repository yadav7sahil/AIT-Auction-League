import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">⚽</span>
            </div>
            <h1 className="text-2xl font-bold text-white">AIT Football Auction League</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-green-400 to-orange-400 bg-clip-text text-transparent">
            AUCTION LEAGUE
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the thrill of real-time football player auctions. Build your dream team, compete with other
            captains, and witness the future of fantasy football.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Captain Card */}
          <Card className="group bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
            <CardContent className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                  <img
                    src="/placeholder.svg?height=120&width=120"
                    alt="Messi Silhouette"
                    className="w-24 h-24 object-contain filter brightness-0 invert"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">CAPTAIN</h3>
                <p className="text-gray-300 mb-6">
                  Lead your team to victory. Bid on players, manage your budget, and build the ultimate squad.
                </p>
                <Link href="/login?role=captain">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
                    LOGIN AS CAPTAIN
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Admin Card - Elevated */}
          <Card className="group bg-gradient-to-br from-orange-900/50 to-red-800/30 border-orange-500/30 hover:border-orange-400/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm transform md:-translate-y-4">
            <CardContent className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-36 h-36 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                  <img
                    src="/placeholder.svg?height=130&width=130"
                    alt="Ronaldo Silhouette"
                    className="w-28 h-28 object-contain filter brightness-0 invert"
                  />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">ADMIN</h3>
                <p className="text-gray-300 mb-6">
                  Control the entire auction platform. Manage users, teams, players, and oversee all operations.
                </p>
                <Link href="/login?role=admin">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/25">
                    ADMIN ACCESS
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Viewer Card */}
          <Card className="group bg-gradient-to-br from-green-900/50 to-emerald-800/30 border-green-500/30 hover:border-green-400/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
            <CardContent className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                  <img
                    src="/placeholder.svg?height=120&width=120"
                    alt="Neymar Silhouette"
                    className="w-24 h-24 object-contain filter brightness-0 invert"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">VIEWER</h3>
                <p className="text-gray-300 mb-6">
                  Watch the action unfold. Follow live auctions, track team progress, and enjoy the spectacle.
                </p>
                <Link href="/dashboard?role=viewer">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/25">
                    ENTER AS VIEWER
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-white mb-8">Experience the Future of Football Auctions</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold text-white mb-2">Real-Time Bidding</h4>
              <p className="text-gray-300">Live auction updates with instant bid notifications</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="text-4xl mb-4">🏆</div>
              <h4 className="text-xl font-semibold text-white mb-2">Team Management</h4>
              <p className="text-gray-300">Build and manage your ultimate football squad</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="text-xl font-semibold text-white mb-2">Mobile Ready</h4>
              <p className="text-gray-300">Seamless experience across all devices</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 py-8 border-t border-white/10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">© 2024 AIT Football Auction League. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
