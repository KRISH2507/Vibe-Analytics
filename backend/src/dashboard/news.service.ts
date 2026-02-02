import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: ['description', 'content', 'summary'],
  },
});

// Free RSS feeds - Indian news sources + global + finance
const RSS_FEEDS = [
  // Indian News
  { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', platform: 'News' },
  { name: 'NDTV', url: 'https://feeds.feedburner.com/ndtvnews-top-stories', platform: 'News' },
  { name: 'India Today', url: 'https://www.indiatoday.in/rss/home', platform: 'News' },
  { name: 'Hindustan Times', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', platform: 'News' },
  
  // Google News India (catches social trends too)
  { name: 'Google News India', url: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en', platform: 'News' },
  
  // Finance & Stock News
  { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', platform: 'News' },
  { name: 'Economic Times Stocks', url: 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms', platform: 'News' },
  { name: 'Moneycontrol News', url: 'https://www.moneycontrol.com/rss/latestnews.xml', platform: 'News' },
  { name: 'Livemint', url: 'https://www.livemint.com/rss/markets', platform: 'News' },
  { name: 'Business Standard', url: 'https://www.business-standard.com/rss/markets-106.rss', platform: 'News' },
  
  // Gold & Commodities
  { name: 'Economic Times Gold', url: 'https://economictimes.indiatimes.com/commoditysummary/symbol-GOLD.cms', platform: 'News' },
  { name: 'Investing.com Gold', url: 'https://www.investing.com/rss/news_301.rss', platform: 'News' },
  
  // Global Business News
  { name: 'Reuters Business', url: 'https://feeds.reuters.com/reuters/businessNews', platform: 'News' },
  { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', platform: 'News' },
  
  // Tech/General (often covers trending topics)
  { name: 'Reddit India', url: 'https://www.reddit.com/r/india/.rss', platform: 'Reddit' },
  { name: 'Reddit IndiaSocial', url: 'https://www.reddit.com/r/indiasocial/.rss', platform: 'Reddit' },
  { name: 'Reddit IndiaInvestments', url: 'https://www.reddit.com/r/IndiaInvestments/.rss', platform: 'Reddit' },
  { name: 'Reddit IndianStockMarket', url: 'https://www.reddit.com/r/IndianStockMarket/.rss', platform: 'Reddit' },
];

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  platform: string;
  pubDate: Date;
  snippet: string;
}

export interface KeywordMatch {
  keyword: string;
  matches: NewsItem[];
  mentionCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  trend: 'up' | 'down' | 'stable';
}

// Simple sentiment detection based on common words
function detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase();
  
  const positiveWords = [
    'success', 'win', 'victory', 'growth', 'boost', 'rise', 'gain', 'profit',
    'celebrate', 'achievement', 'breakthrough', 'launch', 'inaugurat', 'develop',
    'progress', 'improve', 'best', 'great', 'good', 'happy', 'joy', 'award',
    'record', 'historic', 'amazing', 'wonderful', 'excellent', 'proud'
  ];
  
  const negativeWords = [
    'death', 'dead', 'kill', 'murder', 'accident', 'crash', 'fail', 'loss',
    'crisis', 'scandal', 'arrest', 'protest', 'violence', 'attack', 'threat',
    'decline', 'drop', 'fall', 'worst', 'bad', 'tragic', 'disaster', 'flood',
    'earthquake', 'fire', 'explosion', 'corruption', 'scam', 'fraud', 'warning'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

// Calculate trend based on publication times
function calculateTrend(items: NewsItem[]): 'up' | 'down' | 'stable' {
  if (items.length === 0) return 'stable';
  
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  
  const recentCount = items.filter(item => item.pubDate > oneHourAgo).length;
  const olderCount = items.filter(item => item.pubDate > sixHoursAgo && item.pubDate <= oneHourAgo).length;
  
  if (recentCount > olderCount) return 'up';
  if (recentCount < olderCount) return 'down';
  return 'stable';
}

// Fetch all news from RSS feeds
async function fetchAllNews(): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];
  
  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const result = await parser.parseURL(feed.url);
      return result.items.map(item => ({
        title: item.title || '',
        link: item.link || '',
        source: feed.name,
        platform: feed.platform,
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        snippet: (item.contentSnippet || item.title || '').substring(0, 200),
      }));
    } catch (error) {
      // Silently skip failed feeds - some may be blocked or rate-limited
      return [];
    }
  });
  
  const results = await Promise.allSettled(feedPromises);
  
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  });
  
  // Sort by date, newest first
  allItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  
  return allItems;
}

// Fetch targeted news for specific keyword using Google News RSS
async function fetchNewsForKeyword(keyword: string): Promise<NewsItem[]> {
  const searchQuery = encodeURIComponent(keyword.replace(/^#/, ''));
  const googleNewsUrl = `https://news.google.com/rss/search?q=${searchQuery}&hl=en-IN&gl=IN&ceid=IN:en`;
  
  try {
    const result = await parser.parseURL(googleNewsUrl);
    return result.items.slice(0, 20).map(item => ({
      title: item.title || '',
      link: item.link || '',
      source: 'Google News',
      platform: 'News',
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      snippet: (item.contentSnippet || item.title || '').substring(0, 200),
    }));
  } catch (error) {
    console.warn(`Failed to fetch Google News for "${keyword}":`, error);
    return [];
  }
}

// Search for keywords in news
export async function searchKeywordsInNews(keywords: string[]): Promise<{
  keywordMatches: KeywordMatch[];
  platformBreakdown: { name: string; mentions: number; sentiment: number; change: number }[];
  timeline: { time: string; positive: number; neutral: number; negative: number }[];
  alerts: { message: string; time: string; link?: string }[];
  overallSentiment: { positive: number; neutral: number; negative: number };
}> {
  if (keywords.length === 0) {
    return {
      keywordMatches: [],
      platformBreakdown: [
        { name: 'Twitter', mentions: 0, sentiment: 0, change: 0 },
        { name: 'Reddit', mentions: 0, sentiment: 0, change: 0 },
        { name: 'News', mentions: 0, sentiment: 0, change: 0 },
      ],
      timeline: generateEmptyTimeline(),
      alerts: [],
      overallSentiment: { positive: 0, neutral: 0, negative: 0 },
    };
  }
  
  // Fetch general news from all feeds
  const allNews = await fetchAllNews();
  
  // Also fetch targeted news for each keyword from Google News
  const targetedNewsPromises = keywords.map(k => fetchNewsForKeyword(k));
  const targetedNewsResults = await Promise.allSettled(targetedNewsPromises);
  
  // Combine all news
  const combinedNews = [...allNews];
  targetedNewsResults.forEach(result => {
    if (result.status === 'fulfilled') {
      combinedNews.push(...result.value);
    }
  });
  
  // Deduplicate by link
  const seenLinks = new Set<string>();
  const uniqueNews = combinedNews.filter(item => {
    if (seenLinks.has(item.link)) return false;
    seenLinks.add(item.link);
    return true;
  });
  
  const keywordMatches: KeywordMatch[] = [];
  
  // Match keywords against news (support hashtags and multi-word searches)
  for (const keyword of keywords) {
    // Clean keyword: remove # and split into words for better matching
    const cleanKeyword = keyword.replace(/^#/, '').toLowerCase().trim();
    const searchWords = cleanKeyword.split(/\s+/);
    
    const matches = uniqueNews.filter(item => {
      const text = (item.title + ' ' + item.snippet).toLowerCase();
      // Match if all words in the keyword are found in the text
      return searchWords.every(word => text.includes(word));
    });
    
    // Aggregate sentiment from matched articles
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    
    matches.forEach(item => {
      const sentiment = detectSentiment(item.title + ' ' + item.snippet);
      if (sentiment === 'positive') positiveCount++;
      else if (sentiment === 'negative') negativeCount++;
      else neutralCount++;
    });
    
    const total = matches.length || 1;
    const dominantSentiment = positiveCount >= negativeCount && positiveCount >= neutralCount
      ? 'positive'
      : negativeCount >= positiveCount && negativeCount >= neutralCount
        ? 'negative'
        : 'neutral';
    
    keywordMatches.push({
      keyword,
      matches: matches.slice(0, 10), // Keep top 10
      mentionCount: matches.length,
      sentiment: dominantSentiment,
      trend: calculateTrend(matches),
    });
  }
  
  // Calculate platform breakdown
  const platformCounts: Record<string, { mentions: number; positive: number; negative: number; neutral: number }> = {
    'Twitter': { mentions: 0, positive: 0, negative: 0, neutral: 0 },
    'Reddit': { mentions: 0, positive: 0, negative: 0, neutral: 0 },
    'News': { mentions: 0, positive: 0, negative: 0, neutral: 0 },
  };
  
  keywordMatches.forEach(km => {
    km.matches.forEach(item => {
      const platform = item.platform;
      if (platformCounts[platform]) {
        platformCounts[platform].mentions++;
        const sentiment = detectSentiment(item.title);
        platformCounts[platform][sentiment]++;
      }
    });
  });
  
  const platformBreakdown = Object.entries(platformCounts).map(([name, data]) => {
    const total = data.positive + data.negative + data.neutral || 1;
    const sentimentScore = Math.round(((data.positive * 100) + (data.neutral * 50)) / total);
    return {
      name: name as 'Twitter' | 'Reddit' | 'News',
      mentions: data.mentions,
      sentiment: sentimentScore,
      change: Math.floor(Math.random() * 10) - 3, // Small random change for now
    };
  });
  
  // Generate timeline based on actual article times
  const timeline = generateTimeline(keywordMatches);
  
  // Generate alerts from actual news
  const alerts = generateAlerts(keywordMatches);
  
  // Calculate overall sentiment
  const totalMatches = keywordMatches.reduce((sum, km) => sum + km.matches.length, 0);
  let overallPositive = 0;
  let overallNegative = 0;
  let overallNeutral = 0;
  
  keywordMatches.forEach(km => {
    km.matches.forEach(item => {
      const sentiment = detectSentiment(item.title + ' ' + item.snippet);
      if (sentiment === 'positive') overallPositive++;
      else if (sentiment === 'negative') overallNegative++;
      else overallNeutral++;
    });
  });
  
  const total = totalMatches || 1;
  const overallSentiment = {
    positive: Math.round((overallPositive / total) * 100),
    neutral: Math.round((overallNeutral / total) * 100),
    negative: Math.round((overallNegative / total) * 100),
  };
  
  // Ensure percentages add up to 100
  const sum = overallSentiment.positive + overallSentiment.neutral + overallSentiment.negative;
  if (sum !== 100 && sum > 0) {
    overallSentiment.neutral += (100 - sum);
  }
  
  return {
    keywordMatches,
    platformBreakdown,
    timeline,
    alerts,
    overallSentiment,
  };
}

function generateEmptyTimeline() {
  const timeSlots = ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'];
  return timeSlots.map(time => ({ time, positive: 0, neutral: 0, negative: 0 }));
}

function generateTimeline(keywordMatches: KeywordMatch[]) {
  const now = new Date();
  const timeSlots = [
    { label: '6h ago', start: 6, end: 5 },
    { label: '5h ago', start: 5, end: 4 },
    { label: '4h ago', start: 4, end: 3 },
    { label: '3h ago', start: 3, end: 2 },
    { label: '2h ago', start: 2, end: 1 },
    { label: '1h ago', start: 1, end: 0.5 },
    { label: 'Now', start: 0.5, end: 0 },
  ];
  
  return timeSlots.map(slot => {
    const slotStart = new Date(now.getTime() - slot.start * 60 * 60 * 1000);
    const slotEnd = new Date(now.getTime() - slot.end * 60 * 60 * 1000);
    
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    
    keywordMatches.forEach(km => {
      km.matches.forEach(item => {
        if (item.pubDate >= slotStart && item.pubDate < slotEnd) {
          const sentiment = detectSentiment(item.title);
          if (sentiment === 'positive') positive++;
          else if (sentiment === 'negative') negative++;
          else neutral++;
        }
      });
    });
    
    // Return actual counts (not fake percentages)
    return {
      time: slot.label,
      positive: positive,
      neutral: neutral,
      negative: negative,
    };
  });
}

function generateAlerts(keywordMatches: KeywordMatch[]): { message: string; time: string; link?: string }[] {
  const alerts: { message: string; time: string; link?: string }[] = [];
  
  keywordMatches.forEach(km => {
    if (km.matches.length > 0) {
      // Add trending alert
      if (km.trend === 'up') {
        alerts.push({
          message: `"${km.keyword}" is trending with ${km.mentionCount} mentions`,
          time: 'Just now',
        });
      }
      
      // Add latest news headline as alert
      const latestNews = km.matches[0];
      if (latestNews) {
        const timeAgo = getTimeAgo(latestNews.pubDate);
        alerts.push({
          message: `${latestNews.source}: ${latestNews.title.substring(0, 80)}...`,
          time: timeAgo,
          link: latestNews.link,
        });
      }
    } else {
      alerts.push({
        message: `No recent news found for "${km.keyword}"`,
        time: 'Now',
      });
    }
  });
  
  return alerts.slice(0, 6); // Max 6 alerts
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
