import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Check,
  TrendingUp,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
  Clock,
  Infinity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LampToggle } from '@/components/LampToggle';
import { useToast } from '@/hooks/use-toast';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const features = {
  free: [
    { text: '3 keyword tracking', included: true },
    { text: '7-day history', included: true },
    { text: 'Single platform (Twitter)', included: true },
    { text: 'Basic sentiment charts', included: true },
    { text: 'Daily email digest', included: false },
    { text: 'Real-time alerts', included: false },
    { text: 'Export reports', included: false },
    { text: 'Priority data refresh', included: false },
  ],
  pro: [
    { text: 'Unlimited keywords', included: true },
    { text: 'Full historical data', included: true },
    { text: 'All platforms (Twitter, Reddit, News)', included: true },
    { text: 'Advanced analytics', included: true },
    { text: 'Daily email digest', included: true },
    { text: 'Real-time alerts', included: true },
    { text: 'Export reports (CSV, PDF)', included: true },
    { text: 'Priority data refresh', included: true },
  ],
};

const highlights = [
  {
    icon: Infinity,
    title: 'Unlimited Keywords',
    description: 'Track as many topics, brands, and hashtags as you need',
  },
  {
    icon: Zap,
    title: 'Real-time Alerts',
    description: 'Get notified instantly when sentiment shifts dramatically',
  },
  {
    icon: BarChart3,
    title: 'Multi-Platform',
    description: 'Aggregate data from Twitter, Reddit, and major news outlets',
  },
  {
    icon: Clock,
    title: 'Full History',
    description: 'Access complete historical data for trend analysis',
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const monthlyPrice = 499;
  const yearlyPrice = 399; // per month when billed yearly
  const currentPrice = selectedPlan === 'monthly' ? monthlyPrice : yearlyPrice;
  const savings = selectedPlan === 'yearly' ? (monthlyPrice - yearlyPrice) * 12 : 0;

  const handleUpgrade = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      toast({
        title: 'Login Required',
        description: 'Please login to upgrade your plan',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // Create Razorpay order
      const { data: orderData } = await axios.post(
        `${API_URL}/payments/create-order`,
        { plan: selectedPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Vibe Analytics',
        description: `Pro Plan - ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            await axios.post(
              `${API_URL}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({
              title: 'Payment Successful! 🎉',
              description: 'Welcome to Vibe Analytics Pro!',
            });

            // Redirect to dashboard
            setTimeout(() => navigate('/dashboard'), 1500);
          } catch (error) {
            toast({
              title: 'Payment Verification Failed',
              description: 'Please contact support',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#8b5cf6',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Unable to process payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Vibe Analytics</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
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

      {/* Fixed theme toggle for desktop */}
      <div className="fixed top-4 right-20 z-50 hidden md:block">
        <LampToggle />
      </div>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-semibold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more power. No hidden fees.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-8 bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
            {/* Free tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="premium-card p-8"
            >
              <h2 className="text-xl font-semibold mb-2">Free</h2>
              <p className="text-muted-foreground mb-6">Perfect for getting started</p>
              <div className="mb-8">
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <Button variant="outline" className="w-full rounded-xl h-12 mb-8" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>

              <ul className="space-y-4">
                {features.free.map((feature) => (
                  <li
                    key={feature.text}
                    className={`flex items-center gap-3 ${
                      !feature.included && 'text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included
                          ? 'bg-accent/20 text-accent'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {feature.included && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Pro tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="premium-card p-8 border-accent/50 relative overflow-hidden"
            >
              {/* Popular badge */}
              <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Popular
              </div>

              <h2 className="text-xl font-semibold mb-2">Pro</h2>
              <p className="text-muted-foreground mb-6">For professionals and teams</p>
              <div className="mb-2">
                <span className="text-4xl font-bold">₹{currentPrice}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              {selectedPlan === 'yearly' && (
                <p className="text-sm text-sentiment-positive mb-6">
                  Save ₹{savings.toLocaleString()} per year
                </p>
              )}
              {selectedPlan === 'monthly' && <div className="h-6 mb-6" />}

              <Button
                className="w-full rounded-xl h-12 mb-8 bg-accent hover:bg-accent/90"
                onClick={handleUpgrade}
                disabled={isProcessing}
              >
                <Shield className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Upgrade to Pro'}
              </Button>

              <ul className="space-y-4">
                {features.pro.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-serif font-semibold mb-4">
              Everything you need for sentiment intelligence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pro unlocks the full potential of Vibe Analytics with powerful features designed for professionals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((highlight, i) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="premium-card p-6 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <highlight.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{highlight.title}</h3>
                <p className="text-sm text-muted-foreground">{highlight.description}</p>
              </motion.div>
            ))}
          </div>

          {/* FAQ or Trust section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-24 text-center"
          >
            <p className="text-muted-foreground mb-8">
              Trusted by analysts, founders, and marketing teams worldwide
            </p>
            <div className="flex items-center justify-center gap-8 opacity-50">
              {/* Placeholder logos - replace with actual client logos */}
              {['TechCorp', 'FinanceAI', 'MediaPro', 'StartupX'].map((name) => (
                <div
                  key={name}
                  className="text-lg font-semibold text-muted-foreground"
                >
                  {name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Vibe Analytics</span>
          </div>

          <nav className="flex gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/login" className="hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/signup" className="hover:text-foreground transition-colors">
              Sign Up
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            © 2024 Vibe Analytics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
