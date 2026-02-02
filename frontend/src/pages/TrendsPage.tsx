import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  TrendingUp,
  Flame,
  MessageSquare,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  Clock,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch trending topics from Mastodon
async function fetchTrendingTopics() {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(`${API_URL}/trends/mastodon`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export default function TrendsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reddit-trends'],
    queryFn: fetchTrendingTopics,
    refetchInterval: 60000, // Refresh every 60 seconds for fresh top posts
  });

  const getSentimentColor = (value: number) => {
    if (value >= 60) return 'text-sentiment-positive';
    if (value >= 40) return 'text-sentiment-neutral';
    return 'text-sentiment-negative';
  };

  const getSentimentBadge = (sentiment: string) => {
    if (sentiment === 'positive')
      return <Badge className="bg-sentiment-positive/20 text-sentiment-positive border-0">Positive</Badge>;
    if (sentiment === 'neutral')
      return <Badge className="bg-sentiment-neutral/20 text-sentiment-neutral border-0">Neutral</Badge>;
    return <Badge className="bg-sentiment-negative/20 text-sentiment-negative border-0">Negative</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-serif font-semibold flex items-center gap-2">
              <Flame className="w-8 h-8 text-accent" />
              Trending on Mastodon
            </h1>
            <p className="text-muted-foreground mt-1">Real-time trending topics and discussions</p>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Updated 2 min ago
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="premium-card">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Trending Keywords Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Hot Topics</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {data?.trending?.slice(0, 8).map((item: any, i: number) => (
                  <motion.div
                    key={item.keyword}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <a
                      href={item.mastodonUrl || `https://mastodon.social/tags/${item.keyword.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Card className="premium-card hover:shadow-lg hover:shadow-accent/5 transition-all cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <span className="font-semibold text-lg group-hover:text-accent transition-colors">
                              #{item.keyword}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-3.5 h-3.5" />
                              <span>{item.mentions?.toLocaleString() || '0'} mentions</span>
                            </div>
                            <div className="flex items-center justify-between">
                              {getSentimentBadge(item.sentiment)}
                              <span className="text-xs text-muted-foreground">
                                r/{item.topSubreddit || 'mastodon.social'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Top Subreddits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    Top Subreddits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.topSubreddits || []} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis 
                          type="category" 
                          dataKey="subreddit" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            background: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="hsl(260 60% 65%)"
                          radius={[0, 4, 4, 0]}
                          name="Posts"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Discussions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Top Posts</h2>
              </div>
              <Card className="premium-card">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {data?.topPosts?.slice(0, 10).map((post: any, i: number) => (
                      <motion.a
                        key={post.id}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.03 }}
                        className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors group block"
                      >
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold group-hover:text-accent transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                            <span>r/{post.subreddit}</span>
                            <span>•</span>
                            <span>{post.upvotes?.toLocaleString() || 0} upvotes</span>
                            <span>•</span>
                            <span>{post.comments?.toLocaleString() || 0} comments</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {getSentimentBadge(post.sentiment || 'neutral')}
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
