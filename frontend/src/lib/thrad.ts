import { AdData } from './stream';

const THRAD_API_URL = 'https://ssp.thrads.ai/api/v1/ssp/bid-request';
const THRAD_API_KEY = process.env.NEXT_PUBLIC_THRAD_API_KEY || '';

interface ThradMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('thrad_user_id');
  if (!id) {
    id = 'user_' + crypto.randomUUID();
    localStorage.setItem('thrad_user_id', id);
  }
  return id;
}

// TODO: Remove mock data once Thrad API key origin is configured
const MOCK_ADS: AdData[] = [
  {
    advertiser: 'Nike',
    headline: 'Just Do It - New Collection',
    description: 'Discover the latest Nike running shoes designed for every level. Free shipping on orders over $50.',
    cta_text: 'Shop Now',
    url: 'https://www.nike.com',
    image_url: 'https://placehold.co/600x300/111111/FFFFFF?text=Nike',
  },
  {
    advertiser: 'Notion',
    headline: 'Your All-in-One Workspace',
    description: 'Write, plan, and organize in one place. Trusted by teams at the world\'s best companies.',
    cta_text: 'Try Free',
    url: 'https://www.notion.so',
    image_url: 'https://placehold.co/600x300/000000/FFFFFF?text=Notion',
  },
  {
    advertiser: 'Vercel',
    headline: 'Deploy Instantly',
    description: 'The platform for frontend developers. Build and deploy your next project in seconds.',
    cta_text: 'Start Building',
    url: 'https://vercel.com',
    image_url: 'https://placehold.co/600x300/000000/FFFFFF?text=Vercel',
  },
  {
    advertiser: 'Linear',
    headline: 'Issue Tracking, Streamlined',
    description: 'The tool for modern software teams. Plan, track, and ship world-class products.',
    cta_text: 'Get Started',
    url: 'https://linear.app',
    image_url: 'https://placehold.co/600x300/5E6AD2/FFFFFF?text=Linear',
  },
];

export async function fetchThradAd(
  messages: { role: string; content: string }[],
  chatId: string,
): Promise<AdData | null> {
  // Return mock ad data for testing UI
  const randomAd = MOCK_ADS[Math.floor(Math.random() * MOCK_ADS.length)];
  return randomAd;
}
