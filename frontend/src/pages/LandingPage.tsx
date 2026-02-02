import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDown, TrendingUp, MessageCircle, Newspaper, Twitter } from 'lucide-react';
import { CursorReactiveHero } from '@/components/CursorReactiveHero';
import { LampToggle } from '@/components/LampToggle';
import { Button } from '@/components/ui/button';

// Hero section with interactive cursor animation
function HeroSection({ scrollProgress }: { scrollProgress: number }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Cursor reactive animation area with integrated content */}
      <div className="w-full">
        <CursorReactiveHero scrollProgress={scrollProgress} />
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="relative flex flex-col items-center gap-2 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <span className="text-xs text-muted-foreground tracking-wider">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// What We Do section
function WhatWeDoSection() {
  const platforms = [
    { icon: Twitter, name: 'Twitter / X', desc: 'Real-time tweet analysis' },
    { icon: MessageCircle, name: 'Reddit', desc: 'Subreddit sentiment tracking' },
    { icon: Newspaper, name: 'News', desc: 'Media coverage insights' },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6">
            Multi-Platform Intelligence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Aggregate sentiment data from the platforms that matter most. 
            One dashboard, complete visibility.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true, margin: '-50px' }}
              className="premium-card p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <platform.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{platform.name}</h3>
              <p className="text-muted-foreground">{platform.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Visual storytelling section with parallax
function StorytellingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="relative py-40 overflow-hidden">
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent"
        style={{ y }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div style={{ opacity }}>
          <h2 className="text-4xl md:text-6xl font-serif font-semibold mb-8 leading-tight">
            See the conversation
            <br />
            <span className="gradient-text">before it trends</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Our AI-powered analysis identifies emerging patterns in real-time, 
            giving you the foresight to act before the crowd. Track keywords, 
            monitor brands, and understand public opinion at scale.
          </p>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
    </section>
  );
}

// Why This Matters section with staggered cards
function WhyItMattersSection() {
  const features = [
    {
      title: 'Early Detection',
      desc: 'Spot viral content and trending topics hours before they peak. Be first, not last.',
    },
    {
      title: 'Brand Monitoring',
      desc: 'Track your brand sentiment across all platforms. Know what people really think.',
    },
    {
      title: 'Market Intelligence',
      desc: 'Understand market sentiment for stocks, crypto, and more. Make informed decisions.',
    },
    {
      title: 'Crisis Management',
      desc: 'Get instant alerts when sentiment shifts. Respond to PR issues in real-time.',
    },
  ];

  return (
    <section className="py-32 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6">
            Why This Matters
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            In a world driven by public opinion, understanding sentiment isn't optional — it's essential.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, margin: '-50px' }}
              className="premium-card p-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-accent font-semibold">{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing teaser section
function PricingTeaserSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free tier */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="premium-card p-8 text-left"
            >
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <p className="text-3xl font-bold mb-4">₹0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  3 keyword tracking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  7-day history
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Single platform
                </li>
              </ul>
              <Button variant="outline" className="w-full rounded-full" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </motion.div>

            {/* Pro tier */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="premium-card p-8 text-left border-accent/50 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-semibold mb-2">Pro</h3>
              <p className="text-3xl font-bold mb-4">₹999<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Unlimited keywords
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Full history
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  All platforms
                </li>
              </ul>
              <Button className="w-full rounded-full bg-accent hover:bg-accent/90" asChild>
                <Link to="/pricing">Upgrade to Pro</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">Vibe Analytics</span>
        </div>

        <nav className="flex gap-8 text-sm text-muted-foreground">
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
          <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
        </nav>

        <p className="text-sm text-muted-foreground">
          © 2024 Vibe Analytics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// Main landing page
export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const progress = scrollTop / (scrollHeight - clientHeight);
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Vibe Analytics</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Button asChild size="sm" className="rounded-full px-6">
              <Link to="/signup">Get Started</Link>
            </Button>
          </nav>

          <div className="md:hidden">
            <LampToggle />
          </div>
        </div>
      </header>

      {/* Theme toggle for desktop */}
      <div className="fixed top-4 right-20 z-50 hidden md:block">
        <LampToggle />
      </div>

      <HeroSection scrollProgress={scrollProgress} />
      <WhatWeDoSection />
      <StorytellingSection />
      <WhyItMattersSection />
      <PricingTeaserSection />
      <Footer />
    </div>
  );
}
