'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MarketingLayout } from '@/components/marketing-layout'
import {
  Zap,
  Shield,
  Clock,
  BarChart3,
  Radio,
  MessageSquare,
  Code,
  CheckCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Lock,
  Rocket,
  ShieldCheck,
  Building2,
  TrendingUp,
  Server,
} from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="pt-20 pb-20 px-6 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Enterprise SMS & Messaging Infrastructure
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Secure, compliant, and scalable SMS solutions designed for businesses and institutions. Sender IDs, bulk SMS, API integration, and carrier-grade reliability.
              </p>
              <div className="flex gap-4 pt-4 flex-wrap">
                <Button className="bg-teal-600 text-white hover:bg-teal-700 px-8 py-6 text-base font-semibold">
                  Get a Sender ID 
                  <ArrowRight className="ml-2" size={18} />
                </Button>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-base font-semibold">
                  View Pricing
                </Button>
              </div>
            </div>

            {/* Abstract Infrastructure Diagram */}
            <div className="relative h-96 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20">
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full text-teal-600"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <circle cx="200" cy="200" r="150" fill="none" />
                  <circle cx="200" cy="200" r="100" fill="none" />
                  <circle cx="200" cy="200" r="50" fill="none" />
                  <circle cx="200" cy="80" r="20" fill="currentColor" />
                  <circle cx="280" cy="200" r="20" fill="currentColor" />
                  <circle cx="200" cy="320" r="20" fill="currentColor" />
                  <circle cx="120" cy="200" r="20" fill="currentColor" />
                  <line x1="200" y1="100" x2="200" y2="80" />
                  <line x1="260" y1="260" x2="280" y2="200" />
                  <line x1="200" y1="300" x2="200" y2="320" />
                  <line x1="140" y1="140" x2="120" y2="200" />
                </svg>
              </div>
              <div className="relative z-10 text-center">
                <Radio className="mx-auto mb-4 text-teal-600" size={48} />
                <p className="text-sm text-gray-600 font-medium">
                  Global SMS Network
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-6 border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-center text-sm font-semibold text-gray-500 mb-12 uppercase tracking-widest">
            Trusted by leading organizations worldwide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            {[
              { name: 'Finance Bank', type: 'Banking' },
              { name: 'Global Telecom', type: 'Telecom' },
              { name: 'State Services', type: 'Government' },
              { name: 'Care Hospitals', type: 'Healthcare' },
              { name: 'Swift Logistics', type: 'Logistics' },
            ].map((org) => (
              <div key={org.name} className="text-center">
                <div className="h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-2 text-teal-600 font-bold text-xl shadow-sm">
                  {org.name.charAt(0)}
                </div>
                <p className="text-sm font-semibold text-gray-900">{org.name}</p>
                <p className="text-xs text-gray-500">{org.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive SMS and messaging solutions tailored for enterprise operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Radio,
                title: 'Sender ID Registration',
                description:
                  'Register and manage dedicated sender IDs for consistent brand identity and improved deliverability.',
              },
              {
                icon: BarChart3,
                title: 'Bulk SMS',
                description:
                  'Send millions of SMS campaigns with advanced segmentation, scheduling, and real-time analytics.',
              },
              {
                icon: Zap,
                title: 'Transactional SMS',
                description:
                  'Ultra-low latency SMS for OTPs, confirmations, and critical alerts with 99.9% uptime SLA.',
              },
              {
                icon: MessageSquare,
                title: 'Promotional SMS',
                description:
                  'Marketing campaigns with compliance tracking, opt-out management, and audience segmentation.',
              },
              {
                icon: Code,
                title: 'SMS API Integration',
                description:
                  'REST and SMPP APIs for seamless integration into existing applications and workflows.',
              },
              {
                icon: Lock,
                title: 'OTP & Verification',
                description:
                  'Secure one-time passwords for authentication, account verification, and transaction confirmation.',
              },
            ].map((service, idx) => (
              <Card
                key={idx}
                className="p-8 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-3 rounded-xl bg-teal-100 text-teal-600 w-fit mb-4">
                  <service.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why" className="py-20 px-6 border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SignalHub</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade infrastructure built for reliability and compliance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'High Delivery Rates',
                description: '99.9% SMS delivery rate with intelligent routing across 900+ carriers globally.',
              },
              {
                icon: Shield,
                title: 'Secure Infrastructure',
                description:
                  'Enterprise-grade security with encryption, multi-factor authentication, and real-time threat detection.',
              },
              {
                icon: Radio,
                title: 'Carrier-Grade Routing',
                description:
                  'Direct connections to major carriers ensuring optimal delivery paths and reduced latency.',
              },
              {
                icon: CheckCircle,
                title: 'Regulatory Compliance',
                description:
                  'Full compliance with GDPR, HIPAA, PCI-DSS, and local telecom regulations worldwide.',
              },
              {
                icon: Clock,
                title: '24/7 Enterprise Support',
                description:
                  'Dedicated support team with guaranteed response times and technical expertise.',
              },
              {
                icon: BarChart3,
                title: 'Scalable API',
                description: 'Auto-scaling infrastructure handling millions of messages per second without degradation.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-teal-100 text-teal-600 flex-shrink-0">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API & Developer Section */}
      <section id="api" className="py-20 px-6 border-b border-gray-200 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">For Developers</h2>
              <p className="text-lg text-white/90">
                Powerful APIs designed for seamless integration into any application or platform.
              </p>
              <ul className="space-y-4">
                {[
                  'REST API with comprehensive documentation',
                  'SMPP protocol support for legacy systems',
                  'Real-time webhooks and delivery reports',
                  'Multiple SDKs in Node.js, Python, PHP, and Java',
                  'Sandbox environment for testing',
                  'Rate limiting and usage analytics',
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="bg-white text-teal-600 hover:bg-gray-100 mt-4">
                View API Docs <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>

            {/* Code Snippet */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-gray-100">
{`// Send SMS with SignalHub API
const response = await fetch(
  'https://api.signalhub.io/sms/send',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: '+1234567890',
      message: 'Your OTP is: 123456',
      senderId: 'SIGNALHUB',
      type: 'transactional'
    })
  }
);

const result = await response.json();
console.log(result.messageId);`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 border-b border-gray-200 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Scale your messaging without hidden fees or surprise charges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {(() => {
              const plans = [
              {
                name: 'Starter',
                  price: 'KSh 2.50',
                  priceDecimal: '',
                unit: 'per SMS',
                description: 'Perfect for growing businesses',
                  icon: Rocket,
                  accentColor: 'teal',
                features: [
                    { text: 'Up to 10,000 SMS/month', category: 'Sending', highlight: false },
                    { text: 'Basic sender ID', category: 'Sending', highlight: false },
                    { text: 'REST API access', category: 'API', highlight: true },
                    { text: 'Email support', category: 'Support', highlight: false },
                    { text: 'Standard routing', category: 'Sending', highlight: false },
                ],
                cta: 'Get Started',
                  ctaSecondary: 'See full API docs',
                highlighted: false,
              },
              {
                name: 'Professional',
                  price: 'KSh 2.00',
                  priceDecimal: '',
                unit: 'per SMS',
                description: 'For established enterprises',
                  icon: ShieldCheck,
                  accentColor: 'indigo',
                features: [
                    { text: 'Unlimited SMS', category: 'Sending', highlight: true },
                    { text: 'Dedicated sender ID', category: 'Sending', highlight: false },
                    { text: 'REST + SMPP APIs', category: 'API', highlight: true },
                    { text: 'Priority 24/7 support', category: 'Support', highlight: false },
                    { text: 'Advanced analytics', category: 'Support', highlight: false },
                    { text: 'Carrier optimization', category: 'Sending', highlight: false },
                ],
                cta: 'Request Demo',
                  ctaSecondary: 'Compare plans',
                highlighted: true,
                  highlightReason: 'Best balance of cost + deliverability',
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                  priceDecimal: '',
                unit: 'pricing',
                description: 'For large-scale operations',
                  icon: Building2,
                  accentColor: 'slate',
                features: [
                    { text: 'Unlimited everything', category: 'Sending', highlight: true },
                    { text: 'Multiple sender IDs', category: 'Sending', highlight: false },
                    { text: 'Custom integrations', category: 'API', highlight: true },
                    { text: 'Dedicated account manager', category: 'Support', highlight: false },
                    { text: 'SLA guarantee', category: 'Support', highlight: false },
                    { text: 'Custom infrastructure', category: 'Sending', highlight: false },
                ],
                cta: 'Contact Sales',
                  ctaSecondary: 'Talk to an engineer',
                highlighted: false,
              },
              ]

              const getAccentGradient = (accentColor: string) => {
                switch (accentColor) {
                  case 'teal':
                    return 'from-teal-500/20 via-emerald-500/10 to-cyan-500/20'
                  case 'indigo':
                    return 'from-indigo-500/20 via-teal-500/15 to-cyan-500/20'
                  case 'slate':
                    return 'from-slate-500/20 via-teal-500/15 to-indigo-500/20'
                  default:
                    return 'from-teal-500/20 via-emerald-500/10 to-cyan-500/20'
                }
              }

              const getIconBgGradient = (accentColor: string) => {
                switch (accentColor) {
                  case 'teal':
                    return 'from-teal-500 to-emerald-500'
                  case 'indigo':
                    return 'from-indigo-500 via-teal-500 to-cyan-500'
                  case 'slate':
                    return 'from-slate-600 via-teal-500 to-indigo-500'
                  default:
                    return 'from-teal-500 to-emerald-500'
                }
              }

              const getButtonGradient = (accentColor: string, isHighlighted: boolean) => {
                if (isHighlighted) {
                  return 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/30'
                }
                switch (accentColor) {
                  case 'teal':
                    return 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white'
                  case 'indigo':
                    return 'bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white'
                  case 'slate':
                    return 'bg-gradient-to-r from-slate-700 to-teal-600 hover:from-slate-800 hover:to-teal-700 text-white'
                  default:
                    return 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white'
                }
              }

              const getCardBorder = (accentColor: string, isHighlighted: boolean) => {
                if (isHighlighted) {
                  return 'border-teal-300/50 ring-2 ring-teal-500/30'
                }
                switch (accentColor) {
                  case 'teal':
                    return 'border-teal-200/50'
                  case 'indigo':
                    return 'border-indigo-200/50'
                  case 'slate':
                    return 'border-slate-200/50'
                  default:
                    return 'border-teal-200/50'
                }
              }

              const groupedFeatures = (features: typeof plans[0]['features']) => {
                const groups: Record<string, typeof features> = {}
                features.forEach((feature) => {
                  if (!groups[feature.category]) {
                    groups[feature.category] = []
                  }
                  groups[feature.category].push(feature)
                })
                return groups
              }

              return plans.map((plan) => {
                const IconComponent = plan.icon
                const featureGroups = groupedFeatures(plan.features)
                const isHighlighted = plan.highlighted

                return (
                  <div
                    key={plan.name}
                    className={`relative group transition-all duration-300 ${
                      isHighlighted ? 'md:-mt-4 md:mb-4' : ''
                }`}
              >
                    {/* Most Popular Ribbon */}
                    {isHighlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur-sm opacity-75 animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      MOST POPULAR
                          </div>
                        </div>
                  </div>
                )}
                
                    <Card
                      className={`relative overflow-hidden flex flex-col h-full transition-all duration-300 ${
                        isHighlighted
                          ? `bg-gradient-to-b from-teal-50/50 via-white to-white border-2 ${getCardBorder(plan.accentColor, true)} shadow-xl hover:shadow-2xl hover:scale-[1.02]`
                          : `bg-white border ${getCardBorder(plan.accentColor, false)} shadow-md hover:shadow-xl hover:-translate-y-1`
                      }`}
                    >
                      {/* Decorative Background Blob */}
                      <div
                        className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${getAccentGradient(plan.accentColor)} rounded-full blur-3xl opacity-40 -z-0`}
                      ></div>
                      <div
                        className={`absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr ${getAccentGradient(plan.accentColor)} rounded-full blur-2xl opacity-30 -z-0`}
                      ></div>

                      {/* Card Content */}
                      <div className="relative z-10 p-8 flex flex-col h-full">
                        {/* Plan Identity Row */}
                <div className="mb-6">
                          <div className="flex items-center gap-4 mb-3">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getIconBgGradient(plan.accentColor)} flex items-center justify-center shadow-lg`}
                            >
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                              <p className="text-xs text-gray-500 mt-0.5 font-medium">{plan.description}</p>
                            </div>
                          </div>
                          {isHighlighted && plan.highlightReason && (
                            <div className="flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 px-3 py-1.5 rounded-md w-fit">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span className="font-medium">{plan.highlightReason}</span>
                            </div>
                          )}
                </div>

                        {/* Price Section */}
                <div className="mb-8">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                            {plan.priceDecimal && (
                              <span className="text-2xl font-semibold text-gray-500">{plan.priceDecimal}</span>
                            )}
                            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              {plan.unit}
                            </span>
                  </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>No setup fees • Pay as you grow</span>
                          </p>
                </div>

                        {/* Feature List */}
                        <ul className="space-y-4 mb-8 flex-grow">
                          {Object.entries(featureGroups).map(([category, categoryFeatures]) => (
                            <li key={category}>
                              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                {category}
                              </div>
                              <ul className="space-y-2.5">
                                {categoryFeatures.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-3 text-sm">
                                    {feature.highlight ? (
                                      <Sparkles className="text-teal-600 flex-shrink-0 mt-0.5 w-4 h-4" />
                                    ) : (
                                      <CheckCircle2 className="text-teal-600 flex-shrink-0 mt-0.5 w-4 h-4" />
                                    )}
                                    <span className="text-gray-700 leading-relaxed">{feature.text}</span>
                                  </li>
                                ))}
                              </ul>
                    </li>
                  ))}
                </ul>

                        {/* CTA Section */}
                        <div className="mt-auto space-y-3">
                          <Link
                            href={plan.name === 'Enterprise' ? '/contact' : '/auth/register'}
                            className="block"
                          >
                <Button
                              className={`w-full ${getButtonGradient(plan.accentColor, isHighlighted)} group/btn transition-all duration-300`}
                              size="lg"
                            >
                              <span>{plan.cta}</span>
                              <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Button>
                          </Link>
                          <Link
                            href={plan.name === 'Enterprise' ? '/contact' : '/docs'}
                            className="block text-center"
                          >
                            <span className="text-xs text-gray-500 hover:text-teal-600 transition-colors cursor-pointer">
                              {plan.ctaSecondary} →
                            </span>
                          </Link>
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <div
                        className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                          isHighlighted
                            ? 'ring-4 ring-teal-500/20'
                            : plan.accentColor === 'indigo'
                            ? 'ring-2 ring-indigo-500/20'
                            : plan.accentColor === 'slate'
                            ? 'ring-2 ring-slate-500/20'
                            : 'ring-2 ring-teal-500/20'
                        }`}
                      ></div>
              </Card>
                  </div>
                )
              })
            })()}
          </div>

          {/* Trust Row */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-600" />
                <span className="font-medium">Carrier-grade routing</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span className="font-medium">99.9% uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <span className="font-medium">SLA available</span>
              </div>
            </div>
          </div>

          {/* Compare Features Link */}
          <div className="text-center">
            <Link
              href="/pricing#compare"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Compare all features</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Compliance & Security Section */}
      <section className="py-16 px-6 border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Compliance & Security
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🔐', label: 'GDPR Compliant', desc: 'Full data protection compliance' },
              { icon: '⚕️', label: 'HIPAA Certified', desc: 'Healthcare industry standards' },
              { icon: '💳', label: 'PCI-DSS Level 1', desc: 'Highest payment security' },
              { icon: '📋', label: 'Carrier Approved', desc: 'Approved by major carriers' },
            ].map((cert, idx) => (
              <div key={idx} className="text-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{cert.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{cert.label}</h3>
                <p className="text-sm text-gray-600">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Start Sending SMS at Scale
          </h2>
          <p className="text-xl text-gray-600">
            Join hundreds of enterprises using SignalHub for reliable, compliant messaging
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-teal-600 text-white hover:bg-teal-700 px-10 py-6 text-base font-semibold">
              Create Account 
              <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button className="bg-teal-600 text-white hover:bg-teal-700 px-10 py-6 text-base font-semibold">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

    </MarketingLayout>
  )
}
