```j
import { Building, TrendingUp, Home, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#5a2ca0]">Athena</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#" className="text-sm font-medium hover:text-[#5a2ca0]">
              Home
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-[#5a2ca0]">
              Buy
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-[#5a2ca0]">
              Sell
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-[#5a2ca0]">
              Mortgage
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-[#5a2ca0]">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden md:flex">
              Sign In
            </Button>
            <Button className="bg-[#5a2ca0] hover:bg-[#4a1c90]">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with Property Background and Search */}
        <section className="relative h-[600px] w-full">
          <div className="absolute inset-0">
            <Image
              src="/images/twilight-garden.jpeg"
              alt="Beautiful garden pathway at twilight with flowers and property"
              fill
              className="object-cover brightness-[0.9]"
              priority
            />
          </div>
          <div className="relative container h-full flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 max-w-3xl">
              Find Your Dream Home with Athena
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl">
              Discover the perfect property with personalized insights and financing options
            </p>

            {/* Floating Search Component */}
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col gap-4">
                <label htmlFor="address-search" className="text-gray-700 font-medium text-left">
                  Enter location, ZIP code, or address
                </label>
                <Input
                  id="address-search"
                  type="text"
                  placeholder="Start typing to search..."
                  className="h-12 border-2 focus-visible:ring-[#5a2ca0] text-gray-800"
                />
                <p className="text-xs text-gray-500 text-left">
                  Search will begin automatically as you type your address
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How Athena Helps Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#5a2ca0] mb-16">
              How Athena Helps You Find Your Dream Home
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow-sm p-8 relative">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f0e6fa] flex items-center justify-center text-[#5a2ca0] font-bold">
                  1
                </div>
                <div className="w-16 h-16 rounded-full bg-[#5a2ca0] flex items-center justify-center mb-6">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">In-Depth Property Insights</h3>
                <p className="text-gray-600">Understand the property's value, history, and neighborhood trends.</p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-lg shadow-sm p-8 relative">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#fce4f0] flex items-center justify-center text-[#e6007e] font-bold">
                  2
                </div>
                <div className="w-16 h-16 rounded-full bg-[#e6007e] flex items-center justify-center mb-6">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Tailored Loan Options</h3>
                <p className="text-gray-600">
                  See how much you need to borrow and explore loan products suited to you.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-lg shadow-sm p-8 relative">
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#e6f9ef] flex items-center justify-center text-[#00c853] font-bold">
                  3
                </div>
                <div className="w-16 h-16 rounded-full bg-[#00c853] flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Personalized Affordability Check</h3>
                <p className="text-gray-600">
                  Determine if it's within your budget, view your maximum borrowing power, and get tips to improve it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-[#5a2ca0] text-white">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to take the next step? Get pre-approved online in minutes and be ready to make an offer, with
                  expert support available every step of the way.
                </h2>
              </div>
              <Button className="bg-white text-[#5a2ca0] hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                GET PRE-APPROVED
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Properties Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12 text-center">Featured Properties</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="group rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={`/placeholder.svg?height=300&width=500&text=Property ${i}`}
                      alt={`Featured property ${i}`}
                      width={500}
                      height={300}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-[#5a2ca0] text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">Beautiful Home in Prime Location</h3>
                    <p className="text-gray-500 mb-4">123 Main Street, City, State</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-[#5a2ca0]">$1,250,000</span>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>4 beds</span>
                        <span>3 baths</span>
                        <span>2,500 sqft</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button className="bg-[#5a2ca0] hover:bg-[#4a1c90] px-8">View All Properties</Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12 text-center">What Our Clients Say</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-8 rounded-lg shadow-sm">
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#FFD700"
                        stroke="#FFD700"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">
                    "Athena made finding our dream home so easy. The personalized insights and loan options helped us
                    make an informed decision. We couldn't be happier with our new home!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                    <div>
                      <h4 className="font-semibold">John & Sarah Thompson</h4>
                      <p className="text-sm text-gray-500">New Homeowners</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Athena</h3>
              <p className="mb-4">
                Making dream homes a reality with personalized property insights and financing solutions.
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Search Properties
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Mortgage Calculator
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Get Pre-Approved
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white">
                    Buying Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Selling Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Mortgage Options
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    First-Time Buyers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Market Trends
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>123 Real Estate Ave</li>
                <li>Suite 100</li>
                <li>New York, NY 10001</li>
                <li className="pt-2">info@athena.com</li>
                <li>(555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Athena. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

```