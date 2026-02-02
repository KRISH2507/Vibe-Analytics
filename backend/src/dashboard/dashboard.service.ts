import { pool } from "../db";
import { getUserKeywords, countUserKeywords } from "../models/keyword.model";
import { searchKeywordsInNews } from "./news.service";

const FREE_LIMIT = 50;

export async function getDashboardSummary(userId: string) {
  // 1. Fetch user by id from DB
  const { rows } = await pool.query(
    `SELECT id, email, plan, queries_used FROM users WHERE id = $1`,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error("User not found");
  }

  const user = rows[0];

  // 2. Fetch real keywords from DB
  const keywords = await getUserKeywords(userId);
  const keywordCount = await countUserKeywords(userId);

  // 3. Fetch REAL news data for these keywords from RSS feeds
  const keywordStrings = keywords.map(k => k.keyword);
  const newsData = await searchKeywordsInNews(keywordStrings);

  // 4. Build keyword response with real data
  const keywordsWithData = keywords.map(k => {
    const match = newsData.keywordMatches.find(m => m.keyword === k.keyword);
    if (match && match.mentionCount > 0) {
      // Calculate actual sentiment percentage from matched articles
      const positiveMatches = match.matches.filter(m => {
        const text = (m.title + ' ' + m.snippet).toLowerCase();
        const positiveWords = ['success', 'win', 'victory', 'growth', 'boost', 'rise', 'gain', 'profit', 'record', 'best', 'great', 'good'];
        return positiveWords.some(w => text.includes(w));
      }).length;
      const sentimentScore = Math.round((positiveMatches / match.mentionCount) * 100);
      
      return {
        id: k.id,
        keyword: k.keyword,
        sentiment: sentimentScore,
        trend: match.trend,
        mentions: match.mentionCount.toString(),
      };
    }
    // No matches found - show null/no data indicator
    return {
      id: k.id,
      keyword: k.keyword,
      sentiment: null, // null means no data
      trend: 'none' as const,
      mentions: '0',
    };
  });

  // 5. Return full dashboard data with REAL news
  return {
    user: {
      email: user.email,
      plan: user.plan,
    },
    usage: {
      queriesUsed: user.queries_used,
      limit: user.plan === "free" ? FREE_LIMIT : 1000,
    },
    keywords: keywordsWithData,
    stats: {
      activeKeywords: keywordCount,
    },
    sentiment: newsData.overallSentiment,
    timeline: newsData.timeline,
    platforms: newsData.platformBreakdown,
    alerts: newsData.alerts,
  };
}
