import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  summary: string;
  topics: string[];
}

export interface DiscussionData {
  sentiment: SentimentAnalysis;
  volume: number;
  trend: 'rising' | 'stable' | 'cooling';
  examples: Array<{
    username: string;
    subreddit: string;
    text: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
}

/**
 * Generate realistic discussion data using Groq AI
 */
export async function generateTopicAnalysis(keyword: string): Promise<DiscussionData> {
  try {
    const prompt = `You are analyzing social media discussions about "${keyword}". Generate realistic data that reflects current public sentiment and discussions.

Provide your response in this EXACT JSON format (no markdown, no code blocks):
{
  "sentiment_summary": "<2-3 sentence analysis of overall sentiment>",
  "positive_percentage": <number 0-100>,
  "neutral_percentage": <number 0-100>,
  "negative_percentage": <number 0-100>,
  "topics": ["<topic1>", "<topic2>", "<topic3>", "<topic4>", "<topic5>"],
  "discussion_volume": <realistic number between 50-500>,
  "trend": "<rising|stable|cooling>",
  "example_posts": [
    {
      "username": "<realistic username>",
      "instance": "<mastodon.social or other instance>",
      "text": "<realistic 1-2 sentence post about the topic>",
      "sentiment": "<positive|neutral|negative>"
    },
    {
      "username": "<different username>",
      "instance": "<different instance>",
      "text": "<another realistic post>",
      "sentiment": "<positive|neutral|negative>"
    },
    {
      "username": "<different username>",
      "instance": "<another instance>",
      "text": "<another realistic post>",
      "sentiment": "<positive|neutral|negative>"
    },
    {
      "username": "<different username>",
      "instance": "<another instance>",
      "text": "<another realistic post>",
      "sentiment": "<positive|neutral|negative>"
    },
    {
      "username": "<different username>",
      "instance": "<another instance>",
      "text": "<another realistic post>",
      "sentiment": "<positive|neutral|negative>"
    }
  ]
}

Rules:
- Make all data realistic and relevant to "${keyword}"
- Percentages must add up to 100
- Usernames should look real (not generic like user1, user2)
- Posts should reflect actual opinions people might have
- Sentiment distribution should be realistic for this topic
- Return ONLY valid JSON, no other text`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    
    // Extract JSON from response
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }
    
    const data = JSON.parse(jsonStr);

    // Ensure percentages are valid and add up to 100
    let positive = Math.max(0, Math.min(100, data.positive_percentage || 0));
    let neutral = Math.max(0, Math.min(100, data.neutral_percentage || 0));
    let negative = Math.max(0, Math.min(100, data.negative_percentage || 0));
    
    // Normalize to ensure they sum to 100
    const total = positive + neutral + negative;
    if (total === 0) {
      positive = 40;
      neutral = 40;
      negative = 20;
    } else {
      positive = Math.floor((positive / total) * 100);
      neutral = Math.floor((neutral / total) * 100);
      negative = 100 - positive - neutral; // Ensure exact 100% total
    }
    
    const breakdown = { positive, neutral, negative };

    // Determine overall sentiment
    let overall: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (breakdown.positive > 50) overall = 'positive';
    else if (breakdown.negative > 50) overall = 'negative';

    return {
      sentiment: {
        overall,
        breakdown,
        summary: data.sentiment_summary,
        topics: data.topics || [],
      },
      volume: data.discussion_volume || 150,
      trend: data.trend || 'stable',
      examples: data.example_posts.map((post: any) => ({
        username: post.username,
        subreddit: post.instance,
        text: post.text,
        sentiment: post.sentiment,
      })),
    };
  } catch (error) {
    console.error('Groq generation error:', error);
    
    // Fallback data
    return {
      sentiment: {
        overall: 'neutral',
        breakdown: { positive: 40, neutral: 40, negative: 20 },
        summary: `Discussion about ${keyword} shows mixed reactions across social media communities.`,
        topics: [keyword, 'discussion', 'community', 'social media', 'trending'],
      },
      volume: 125,
      trend: 'stable',
      examples: [
        {
          username: 'tech_enthusiast',
          subreddit: 'mastodon.social',
          text: `Interesting developments around ${keyword} lately. Worth keeping an eye on.`,
          sentiment: 'positive',
        },
        {
          username: 'daily_observer',
          subreddit: 'mstdn.social',
          text: `Not sure what to make of ${keyword} yet. Need more information.`,
          sentiment: 'neutral',
        },
        {
          username: 'skeptical_user',
          subreddit: 'fosstodon.org',
          text: `I have some concerns about ${keyword}. Let's see how this plays out.`,
          sentiment: 'negative',
        },
      ],
    };
  }
}
