"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, ArrowLeft, Star, DollarSign, User, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function AddPlayerPage() {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    rollNo: "",
    dept: "",
    rating: "50",
    basePrice: "50",
    description: "",
  })
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
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (!formData.name || !formData.position || !formData.rollNo || !formData.dept) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    if (Number.parseInt(formData.rating) < 1 || Number.parseInt(formData.rating) > 100) {
      setError("Rating must be between 1 and 100")
      setLoading(false)
      return
    }

    if (Number.parseInt(formData.basePrice) < 10) {
      setError("Base price must be at least $10")
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          rating: Number.parseInt(formData.rating),
          basePrice: Number.parseInt(formData.basePrice),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Player added successfully!")
        setTimeout(() => {
          router.push("/admin/players")
        }, 2000)
      } else {
        setError(data.message || "Failed to add player")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const positions = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger"]

  const departments = [
    "Computer Science",
    "Information Technology",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "MBA",
    "MCA",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin/players" className="text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Add New Player</h1>
                <p className="text-gray-300 text-sm">Create a new player profile for auctions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">Add New Player</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Fill in the player details to add them to the auction pool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/20 border-green-500/50 text-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="Enter player's full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-white">
                        Position *
                      </Label>
                      <Select
                        value={formData.position}
                        onValueChange={(value) => handleSelectChange("position", value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Academic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rollNo" className="text-white">
                        Roll Number *
                      </Label>
                      <Input
                        id="rollNo"
                        name="rollNo"
                        type="text"
                        value={formData.rollNo}
                        onChange={handleChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="e.g., 21CS001"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dept" className="text-white">
                        Department *
                      </Label>
                      <Select value={formData.dept} onValueChange={(value) => handleSelectChange("dept", value)}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Auction Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Auction Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating" className="text-white">
                        Player Rating (1-100) *
                      </Label>
                      <div className="relative">
                        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 w-4 h-4" />
                        <Input
                          id="rating"
                          name="rating"
                          type="number"
                          min="1"
                          max="100"
                          value={formData.rating}
                          onChange={handleChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                          placeholder="50"
                          required
                        />
                      </div>
                      <p className="text-gray-400 text-sm">Rate the player's overall skill (1-100)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="basePrice" className="text-white">
                        Base Price ($) *
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
                        <Input
                          id="basePrice"
                          name="basePrice"
                          type="number"
                          min="10"
                          value={formData.basePrice}
                          onChange={handleChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                          placeholder="50"
                          required
                        />
                      </div>
                      <p className="text-gray-400 text-sm">Starting price for auction bidding</p>
                    </div>
                  </div>
                </div>

                {/* Optional Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Player Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                    placeholder="Add any additional information about the player..."
                  />
                </div>

                {/* Player Preview */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Player Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Name:</span>
                        <span className="text-white ml-2 font-semibold">{formData.name || "Player Name"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Position:</span>
                        <span className="text-white ml-2 font-semibold">{formData.position || "Position"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Roll No:</span>
                        <span className="text-white ml-2 font-semibold">{formData.rollNo || "Roll Number"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Department:</span>
                        <span className="text-white ml-2 font-semibold">{formData.dept || "Department"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Rating:</span>
                        <span className="text-yellow-400 ml-2 font-semibold">{formData.rating}/100</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Base Price:</span>
                        <span className="text-green-400 ml-2 font-semibold">${formData.basePrice}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-4">
                  <Link href="/admin/players" className="flex-1">
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
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90 text-white font-semibold py-3 transition-all duration-300 shadow-lg"
                  >
                    {loading ? "Adding Player..." : "Add Player"}
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
