import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminAuctionLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>

      {/* Header Skeleton */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-6 h-6 bg-white/20" />
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-full bg-white/20" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-white/20" />
                <Skeleton className="h-4 w-48 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Auction Status Skeleton */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-white/20" />
              <Skeleton className="h-4 w-32 bg-white/20" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <Skeleton className="h-4 w-24 bg-white/20 mb-2" />
                <Skeleton className="h-6 w-40 bg-white/20 mb-1" />
                <Skeleton className="h-4 w-32 bg-white/20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <Skeleton className="h-4 w-20 bg-white/20 mb-1" />
                  <Skeleton className="h-8 w-16 bg-white/20" />
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <Skeleton className="h-4 w-16 bg-white/20 mb-1" />
                  <Skeleton className="h-8 w-12 bg-white/20" />
                </div>
              </div>

              <div className="flex space-x-3">
                <Skeleton className="h-10 flex-1 bg-white/20" />
                <Skeleton className="h-10 flex-1 bg-white/20" />
              </div>
            </CardContent>
          </Card>

          {/* Start New Auction Skeleton */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <Skeleton className="h-6 w-36 bg-white/20" />
              <Skeleton className="h-4 w-48 bg-white/20" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-white/20" />
                <Skeleton className="h-10 w-full bg-white/20" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/20" />
                <Skeleton className="h-10 w-full bg-white/20" />
              </div>

              <Skeleton className="h-12 w-full bg-white/20" />
            </CardContent>
          </Card>
        </div>

        {/* Available Players Skeleton */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mt-8">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-white/20" />
            <Skeleton className="h-4 w-36 bg-white/20" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <Skeleton className="h-5 w-32 bg-white/20 mb-2" />
                  <Skeleton className="h-4 w-24 bg-white/20 mb-1" />
                  <Skeleton className="h-3 w-20 bg-white/20 mb-2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-12 bg-white/20" />
                    <Skeleton className="h-4 w-16 bg-white/20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
