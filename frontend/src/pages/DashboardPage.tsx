import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageCircle,
  Sparkles,
  Hash,
  Flame,
  Wind,
  User,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch Mastodon + Groq analysis
async function fetchAnalysis(keyword: string) {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(`${API_URL}/analyze?keyword=${encodeURIComponent(keyword)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export default function DashboardPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [limitError, setLimitError] = useState<any>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['reddit-analysis', activeKeyword],
    queryFn: () => fetchAnalysis(activeKeyword),
    enabled: !!activeKeyword,
    retry: false,
  });

  // Handle usage limit errors
  if (error && !limitError) {
    const axiosError = error as any;
    if (axiosError.response?.status === 403) {
      setLimitError(axiosError.response.data);
    }
  }

  const handleResetUsage = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_URL}/analyze/reset-usage`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLimitError(null);
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset usage:', err);
    }
  };

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      setLimitError(null);
      setActiveKeyword(searchKeyword.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'rising':
      case 'heating':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'cooling':
        return <Wind className="w-5 h-5 text-blue-400" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const sentimentData = data?.sentiment?.breakdown
    ? [
        { name: 'Positive', value: data.sentiment.breakdown.positive, color: '#10b981' },
        { name: 'Neutral', value: data.sentiment.breakdown.neutral, color: '#f59e0b' },
        { name: 'Negative', value: data.sentiment.breakdown.negative, color: '#ef4444' },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header with Usage Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl font-serif font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">AI-powered sentiment analysis powered by Groq</p>
          </div>
          {data?.usage && (
            <div className="bg-card border border-border rounded-xl px-4 py-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Searches:</span>
                <span className="font-semibold">
                  {data.usage.queriesUsed} / {data.usage.limit}
                </span>
                {data.usage.plan === 'free' && data.usage.remaining <= 1 && (
                  <Badge variant="destructive" className="ml-2">
                    Upgrade to Pro
                  </Badge>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-6"
        >
          {/* Usage Limit Alert */}
          {limitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{limitError.message || 'Search limit reached'}</p>
                  <p className="text-sm mt-1">
                    {limitError.queriesUsed}/{limitError.limit} searches used on {limitError.plan} plan
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleResetUsage}>
                    Reset Counter (Dev)
                  </Button>
                  <Button size="sm" onClick={() => window.location.href = '/pricing'}>
                    Upgrade Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search keyword or hashtag (e.g. #Chandigarh, Bitcoin, IPL, traffic in Delhi)"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 h-14 rounded-xl text-lg"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchKeyword.trim()}
              className="h-14 px-8 rounded-xl gap-2 text-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Analyze <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {/* Empty State */}
          {!activeKeyword && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Search any keyword or hashtag</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Analyze real Reddit discussions powered by AI. Get instant insights on sentiment, trends, and what people are saying.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['#Chandigarh', 'IPL 2026', 'Bitcoin', 'traffic in Delhi'].map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent/10 hover:border-accent"
                    onClick={() => {
                      setSearchKeyword(suggestion);
                      setActiveKeyword(suggestion);
                    }}
                  >
                    Try "{suggestion}"
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-64" />
              <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <MessageCircle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No recent discussions found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                We couldn't find recent Reddit discussions about "{activeKeyword}". Try a different keyword.
              </p>
              <Button onClick={() => setActiveKeyword('')} variant="outline">
                Try another search
              </Button>
            </motion.div>
          )}

          {/* Results */}
          {data && !isLoading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="premium-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Overall Sentiment</p>
                          <p className={`text-3xl font-bold capitalize ${getSentimentColor(data.sentiment?.overall)}`}>
                            {data.sentiment?.overall || 'Neutral'}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-accent" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="premium-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Discussion Volume</p>
                          <p className="text-3xl font-bold">{data.volume || 0} posts</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-accent" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="premium-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Trend Direction</p>
                          <p className="text-3xl font-bold capitalize">{data.trend || 'Stable'}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          {getTrendIcon(data.trend)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* AI Summary - Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="premium-card border-accent/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl">What people are saying right now</CardTitle>
                        <Badge variant="outline" className="mt-2 border-accent/30 text-accent">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Analyzed by Groq • Llama 3.1
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg leading-relaxed whitespace-pre-line">
                      {data.summary || 'No summary available.'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Two Column Layout */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Sentiment Breakdown */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle>Sentiment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {sentimentData.length > 0 ? (
                        <>
                          <div className="h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={sentimentData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={70}
                                  outerRadius={100}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {sentimentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  contentStyle={{
                                    background: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '12px',
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="text-center">
                                <div className="text-3xl font-bold">100%</div>
                                <div className="text-sm text-muted-foreground">Total</div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3 mt-6">
                            {sentimentData.map((item) => (
                              <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="text-sm">{item.name}</span>
                                </div>
                                <span className="text-sm font-semibold">{item.value}%</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                          No sentiment data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Top Topics */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle>Top Topics & Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data.topics && data.topics.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {data.topics.map((topic: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + index * 0.05 }}
                            >
                              <Badge variant="secondary" className="px-3 py-2">
                                <Hash className="w-3 h-3 mr-1" />
                                {topic}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                          No topics detected
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Example Discussions */}
              {data.examples && data.examples.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle>Example Discussions</CardTitle>
                      <p className="text-sm text-muted-foreground">Real posts and comments from Reddit</p>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="space-y-2">
                        {data.examples.map((example: any, index: number) => (
                          <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border rounded-lg px-4"
                          >
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3 text-left w-full">
                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm">u/{example.username}</span>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-sm text-muted-foreground">
                                      r/{example.subreddit}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground truncate mt-1">
                                    {example.text.substring(0, 80)}...
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    example.sentiment === 'positive'
                                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                      : example.sentiment === 'negative'
                                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                  }
                                >
                                  {example.sentiment}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4">
                              <div className="pl-11">
                                <p className="text-sm leading-relaxed">{example.text}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
