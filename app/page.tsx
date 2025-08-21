"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Shield,
  Zap,
  Users,
  Brain,
  Activity,
  ArrowRight,
  Sparkles,
  Stethoscope,
  UserCheck,
  Clock
} from "lucide-react"

// Magic UI Components
import Particles from "@/components/magic-ui/particles"
import AnimatedGradientText from "@/components/magic-ui/animated-gradient-text"
import { DotPattern } from "@/components/magic-ui/dot-pattern"
import ClientOnly from "@/components/client-only"

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: "IA Médica Avanzada",
      description: "Análisis inteligente de casos médicos con precisión del 95%"
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Encriptación de extremo a extremo y cumplimiento HIPAA"
    },
    {
      icon: Zap,
      title: "Respuesta Instantánea",
      description: "Evaluaciones médicas en tiempo real 24/7"
    },
    {
      icon: Users,
      title: "Colaboración Global",
      description: "Red de especialistas conectados mundialmente"
    }
  ]

  const stats = [
    { number: "50K+", label: "Casos Evaluados", icon: Stethoscope },
    { number: "1,200+", label: "Médicos Activos", icon: UserCheck },
    { number: "24/7", label: "Disponibilidad", icon: Clock },
    { number: "95%", label: "Precisión IA", icon: Brain }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <ClientOnly>
          <Particles
            className="absolute inset-0"
            quantity={50}
            ease={80}
            color="#ffffff"
            refresh={false}
          />
        </ClientOnly>
        <DotPattern
          className="opacity-10"
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Animated Badge */}
          <div className="mb-8 flex justify-center">
            <AnimatedGradientText>
              <Sparkles className="mr-2 h-4 w-4" />
              Revolucionando la Medicina Digital
            </AnimatedGradientText>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
            VITAL RED
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Plataforma de Referencia y Contrarreferencia Médica
          </p>

          <p className="text-lg text-gray-400 mb-12 max-w-4xl mx-auto">
            Conectamos especialistas médicos con inteligencia artificial avanzada para brindar
            atención médica de excelencia en tiempo real, transformando la manera en que se
            toman decisiones críticas en salud.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <Heart className="mr-2 h-5 w-5" />
                Acceder al Sistema
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm transition-all duration-300"
            >
              Ver Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center group">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group-hover:scale-105">
                    <Icon className="h-8 w-8 text-blue-400 mx-auto mb-3 group-hover:text-blue-300 transition-colors" />
                    <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Características Principales
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Tecnología médica avanzada para profesionales de la salud
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 group text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-4 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl font-bold text-white mb-6">
              ¿Listo para Comenzar?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Únete a miles de profesionales médicos que confían en VITAL RED
            </p>

            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <Heart className="mr-3 h-6 w-6" />
                Acceder al Sistema
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-2">VITAL RED</h3>
          <p className="text-gray-400 mb-6">
            Transformando la medicina con tecnología de vanguardia
          </p>
          <div className="text-sm text-gray-500">
            © 2024 VITAL RED - Hospital Universitaria ESE
          </div>
        </div>
      </footer>
    </div>
  )
}
