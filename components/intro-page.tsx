"use client"

import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  Wallet,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function IntroPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/auth/login")
  }

  const features = [
    {
      icon: TrendingUp,
      title: "Smart Budget Tracking",
      description: "Automatically categorize expenses and visualize your spending patterns in real-time",
    },
    {
      icon: Target,
      title: "Goal-Based Savings",
      description: "Set financial goals and track progress with gamified milestones and rewards",
    },
    {
      icon: MessageSquare,
      title: "AI Financial Assistant",
      description: "Chat with your personal AI advisor anytime for financial guidance and spending insights",
    },
    {
      icon: Zap,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations to optimize spending and maximize savings",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your financial data is encrypted and protected with industry-leading security",
    },
  ]

  const benefits = [
    "Import transactions via CSV or manual entry",
    "Track recurring subscriptions automatically",
    "Visualize spending with beautiful charts",
    "Set and achieve savings goals",
    "Chat with AI assistant for instant advice",
    "Get AI-powered financial recommendations",
    "Earn rewards for smart financial habits",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white overflow-x-hidden">
      {/* Header with Finestra branding */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0F4C81] rounded-xl flex items-center justify-center shadow-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-[#0F4C81]">Finestra</span>
          </div>
          <Button
            onClick={handleGetStarted}
            className="bg-[#0F4C81] hover:bg-[#0D3F6B] text-white font-semibold rounded-xl"
          >
            Sign In
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-12 md:py-16 lg:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#0F4C81]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#91A8D0]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Removed redundant Finestra mentions */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F4C81]/10 border border-[#0F4C81]/20 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-[#0F4C81]" />
            <span className="text-sm font-semibold text-[#0F4C81]">Finance made simple</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-balance leading-[1.1] mb-6 text-gray-900">
            Master Your Money,
            <br />
            Achieve Your <span className="text-[#0F4C81]">Goals</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The smart finance app that helps you track spending, set goals, and save more—all with AI-powered insights
            and gamified rewards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="px-8 py-6 text-lg font-bold bg-[#0F4C81] hover:bg-[#0D3F6B] text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all group"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#0F4C81]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#0F4C81]" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#0F4C81]" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-gray-900">
              Everything you need to
              <br />
              <span className="text-[#0F4C81]">take control of your finances</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you understand, manage, and grow your wealth
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white border border-gray-200 rounded-3xl hover:shadow-xl hover:border-[#0F4C81]/20 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#0F4C81]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0F4C81]/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-[#0F4C81]" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-balance text-gray-900">
                Built for your
                <br />
                <span className="text-[#0F4C81]">financial success</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our app combines powerful automation with intuitive design to make managing money effortless. Track
                every rupee, achieve every goal.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#0F4C81] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#0F4C81]/20 via-[#91A8D0]/20 to-[#0F4C81]/10 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4/5 h-4/5 bg-white backdrop-blur-sm rounded-2xl border-2 border-[#0F4C81]/20 shadow-2xl flex flex-col items-center justify-center p-8">
                    <div className="text-6xl font-black text-[#0F4C81] mb-4">₹50,000</div>
                    <div className="text-xl font-bold text-gray-900 mb-2">Monthly Budget</div>
                    <div className="text-sm text-gray-600 text-center">Track spending across categories</div>
                    <div className="mt-8 w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-[#0F4C81] to-[#91A8D0]"></div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">75% utilized</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-[#0F4C81]/10 via-[#91A8D0]/10 to-[#0F4C81]/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-900">
            Ready to transform your
            <br />
            <span className="text-[#0F4C81]">financial future?</span>
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already achieving their financial goals with our smart budget tracking app.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="px-10 py-7 text-xl font-bold bg-[#0F4C81] hover:bg-[#0D3F6B] text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all group"
          >
            Get Started
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          <p>© 2025 Finestra. Built with AI-powered insights for smarter money management.</p>
        </div>
      </footer>
    </div>
  )
}
