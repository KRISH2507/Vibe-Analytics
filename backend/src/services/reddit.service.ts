import axios from 'axios';

const MASTODON_INSTANCE = process.env.MASTODON_INSTANCE || 'https://mastodon.social';

export interface MastodonPost {
  id: string;
  title: string;
  text: string;
  author: string;
  instance: string;
  favourites: number;
  replies: number;
  url: string;
  created: Date;
}

/**
 * Search Mastodon for posts matching a keyword
 */
export async function searchMastodon(keyword: string, limit: number = 100): Promise<MastodonPost[]> {
  try {
    const response = await axios.get(`${MASTODON_INSTANCE}/api/v2/search`, {
      params: {
        q: keyword,
        type: 'statuses',
        limit: Math.min(limit, 40), // Mastodon limits to 40 per request
        resolve: true,
      },
      timeout: 10000,
    });

    const posts: MastodonPost[] = response.data.statuses.map((status: any) => ({
      id: status.id,
      title: stripHtml(status.content).substring(0, 100),
      text: stripHtml(status.content),
      author: status.account.username,
      instance: status.account.acct.split('@')[1] || 'mastodon.social',
      favourites: status.favourites_count || 0,
      replies: status.replies_count || 0,
      url: status.url || status.uri,
      created: new Date(status.created_at),
    }));

    return posts;
  } catch (error) {
    console.error('Mastodon search error:', error);
    return [];
  }
}

/**
 * Get trending posts from Mastodon
 */
export async function getTrendingTopics(limit: number = 50): Promise<MastodonPost[]> {
  try {
    const response = await axios.get(`${MASTODON_INSTANCE}/api/v1/trends/statuses`, {
      params: { limit: Math.min(limit, 40) },
      timeout: 10000,
    });

    const posts: MastodonPost[] = response.data.map((status: any) => ({
      id: status.id,
      title: stripHtml(status.content).substring(0, 100),
      text: stripHtml(status.content),
      author: status.account.username,
      instance: status.account.acct.split('@')[1] || 'mastodon.social',
      favourites: status.favourites_count || 0,
      replies: status.replies_count || 0,
      url: status.url || status.uri,
      created: new Date(status.created_at),
    }));

    return posts;
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
}

/**
 * Get public timeline from Mastodon
 */
export async function getPublicTimeline(limit: number = 40): Promise<MastodonPost[]> {
  try {
    const response = await axios.get(`${MASTODON_INSTANCE}/api/v1/timelines/public`, {
      params: { limit: Math.min(limit, 40) },
      timeout: 10000,
    });

    const posts: MastodonPost[] = response.data.map((status: any) => ({
      id: status.id,
      title: stripHtml(status.content).substring(0, 100),
      text: stripHtml(status.content),
      author: status.account.username,
      instance: status.account.acct.split('@')[1] || 'mastodon.social',
      favourites: status.favourites_count || 0,
      replies: status.replies_count || 0,
      url: status.url || status.uri,
      created: new Date(status.created_at),
    }));

    return posts;
  } catch (error) {
    console.error('Error fetching public timeline:', error);
    return [];
  }
}

/**
 * Get trending hashtags
 */
export async function getTrendingHashtags(): Promise<string[]> {
  try {
    const response = await axios.get(`${MASTODON_INSTANCE}/api/v1/trends/tags`, {
      params: { limit: 20 },
      timeout: 10000,
    });

    return response.data.map((tag: any) => tag.name);
  } catch (error) {
    console.error('Error fetching hashtags:', error);
    return [];
  }
}

/**
 * Strip HTML tags from Mastodon content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}
