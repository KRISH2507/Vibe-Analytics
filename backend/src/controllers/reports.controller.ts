import { Request, Response } from 'express';
import { pool } from '../db';

/**
 * GET /api/reports/history
 * Get user's search history
 */
export async function getSearchHistory(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT keyword, sentiment, volume, top_subreddit, created_at as timestamp
       FROM search_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const history = result.rows.map(row => ({
      keyword: row.keyword,
      sentiment: row.sentiment,
      volume: row.volume,
      topSubreddit: row.top_subreddit,
      timestamp: row.timestamp,
    }));

    // Calculate stats
    const stats = {
      totalSearches: history.length,
      avgSentiment: calculateAvgSentiment(history),
      totalPosts: history.reduce((sum, h) => sum + h.volume, 0),
      uniqueSubreddits: new Set(history.map(h => h.topSubreddit)).size,
    };

    res.json({ history, stats });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}

/**
 * GET /api/reports/export/csv
 * Export search history as CSV
 */
export async function exportCSV(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT keyword, sentiment, volume, top_subreddit, created_at
       FROM search_history
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const csv = [
      'Keyword,Sentiment,Volume,Top Subreddit,Date',
      ...result.rows.map(row =>
        `"${row.keyword}","${row.sentiment}",${row.volume},"${row.top_subreddit}","${row.created_at}"`
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=search-history.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export' });
  }
}

/**
 * GET /api/reports/export/pdf
 * Export search history as PDF (simplified - would need pdf library)
 */
export async function exportPDF(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // For now, return a simple text file
    // In production, use a library like pdfkit or puppeteer
    const result = await pool.query(
      `SELECT keyword, sentiment, volume, top_subreddit, created_at
       FROM search_history
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const content = `REDDIT ANALYSIS REPORT\n\nGenerated: ${new Date().toISOString()}\n\n` +
      result.rows.map((row, i) =>
        `${i + 1}. ${row.keyword}\n   Sentiment: ${row.sentiment}\n   Volume: ${row.volume}\n   Top Subreddit: r/${row.top_subreddit}\n   Date: ${row.created_at}\n`
      ).join('\n');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=search-history.pdf');
    res.send(content); // In production, generate actual PDF
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ error: 'Failed to export' });
  }
}

function calculateAvgSentiment(history: any[]): string {
  if (history.length === 0) return '0%';
  
  const sentimentScores = {
    positive: 100,
    neutral: 50,
    negative: 0,
  };

  const total = history.reduce((sum, h) => sum + (sentimentScores[h.sentiment as keyof typeof sentimentScores] || 50), 0);
  const avg = Math.round(total / history.length);
  
  return `${avg}%`;
}
