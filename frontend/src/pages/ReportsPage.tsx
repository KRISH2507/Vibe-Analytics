import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Download,
  Calendar,
  Search,
  Clock,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fetch search history
async function fetchSearchHistory() {
  const token = localStorage.getItem('authToken');
  const res = await axios.get(`${API_URL}/reports/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['search-history'],
    queryFn: fetchSearchHistory,
  });

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await axios.get(`${API_URL}/reports/export/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reddit-analysis-report-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return 'text-sentiment-positive';
    if (sentiment === 'neutral') return 'text-sentiment-neutral';
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-semibold">Search History</h1>
            <p className="text-muted-foreground mt-1">View and export your past Mastodon analyses</p>
          </div>

          {/* Export button */}
          <Button
            variant="outline"
            className="gap-2 rounded-xl"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Card className="premium-card">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid sm:grid-cols-4 gap-4"
            >
              <Card className="premium-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <Search className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Searches</p>
                      <p className="text-2xl font-bold">{data?.stats?.totalSearches || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-sentiment-positive/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-sentiment-positive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Sentiment</p>
                      <p className="text-2xl font-bold">{data?.stats?.avgSentiment || '0%'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Posts Analyzed</p>
                      <p className="text-2xl font-bold">{data?.stats?.totalPosts?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subreddits</p>
                      <p className="text-2xl font-bold">{data?.stats?.uniqueSubreddits || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Search History Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="premium-card overflow-hidden">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[160px]">Date & Time</TableHead>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">Overall Sentiment</TableHead>
                      <TableHead className="text-right">Top Subreddit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.history?.length > 0 ? (
                      data.history.map((row: any, i: number) => (
                        <TableRow
                          key={`${row.id}-${i}`}
                          className="cursor-pointer hover:bg-muted/30"
                        >
                          <TableCell className="font-medium text-muted-foreground">
                            {format(new Date(row.timestamp), 'MMM dd, HH:mm')}
                          </TableCell>
                          <TableCell className="font-semibold">{row.keyword}</TableCell>
                          <TableCell className="text-right">
                            {row.volume?.toLocaleString() || '0'}
                          </TableCell>
                          <TableCell className="text-right">
                            {getSentimentBadge(row.sentiment)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            r/{row.topSubreddit || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => window.location.href = `/dashboard?keyword=${encodeURIComponent(row.keyword)}`}
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          No search history yet. Start analyzing keywords from the Dashboard!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
