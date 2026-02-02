import { Request, Response } from 'express';
import { generateTopicAnalysis } from '../services/groq.service';
import { pool } from '../db';

/**
 * GET /api/analyze?keyword=...
 * Main endpoint for AI-powered topic analysis
 */
export async function analyzeKeyword(req: Request, res: Response) {
  try {
    const keyword = req.query.keyword as string;
    const userId = (req.user as any)?.id;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Step 1: Check user's plan and usage
    const userResult = await pool.query(
      'SELECT plan, queries_used FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const plan = user.plan || 'free';
    const queriesUsed = user.queries_used || 0;

    // Step 2: Enforce limits based on plan
    const limits: Record<string, number> = {
      free: 3,
      pro: 1000,
      enterprise: 10000,
    };

    const userLimit = limits[plan] || 3;

    if (queriesUsed >= userLimit) {
      return res.status(403).json({
        error: 'Search limit reached',
        message: `You have reached your ${plan} plan limit of ${userLimit} searches. Upgrade to Pro for unlimited searches.`,
        queriesUsed,
        limit: userLimit,
        plan,
      });
    }

    // Step 3: Generate analysis using Groq AI
    const analysis = await generateTopicAnalysis(keyword);

    // Step 4: Increment usage counter
    await pool.query(
      'UPDATE users SET queries_used = queries_used + 1 WHERE id = $1',
      [userId]
    );

    // Step 5: Store search in history
    try {
      await pool.query(
        `INSERT INTO search_history (user_id, keyword, sentiment, volume, top_subreddit, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [userId, keyword, analysis.sentiment.overall, analysis.volume, analysis.examples[0]?.subreddit || 'mastodon.social']
      );
    } catch (dbError) {
      console.error('Failed to save search history:', dbError);
    }

    // Step 6: Return results with usage info
    res.json({
      sentiment: analysis.sentiment,
      summary: analysis.sentiment.summary,
      topics: analysis.sentiment.topics,
      volume: analysis.volume,
      trend: analysis.trend,
      examples: analysis.examples,
      usage: {
        queriesUsed: queriesUsed + 1,
        limit: userLimit,
        plan,
        remaining: userLimit - queriesUsed - 1,
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze keyword' });
  }
}

/**
 * POST /api/analyze/reset-usage
 * Reset usage counter for testing (development only)
 */
export async function resetUsage(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await pool.query(
      'UPDATE users SET queries_used = 0 WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Usage counter reset successfully' });
  } catch (error) {
    console.error('Reset usage error:', error);
    res.status(500).json({ error: 'Failed to reset usage' });
  }
}
