// Notion sync utilities for Mission Control
const NOTION_API_KEY = require('fs').readFileSync(require('os').homedir() + '/.config/notion/api_key', 'utf8').trim();
const NOTION_VERSION = '2022-06-28';

const PAGES = {
  VENTURE_PROTOCOL: '28c90d9f-721e-80ed-8022-c270605752d6',
  MISSION_CONTROL: '30b90d9f-721e-809d-a99b-c6a9f086ff73'
};

async function notionRequest(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json'
    }
  };
  if (body) opts.body = JSON.stringify(body);
  
  const res = await fetch(`https://api.notion.com/v1${endpoint}`, opts);
  if (!res.ok) throw new Error(`Notion API error: ${res.status} ${await res.text()}`);
  return res.json();
}

// Get Venture Protocol database entries
async function getVentureProtocolContent() {
  // First find databases under Venture Protocol page
  const blocks = await notionRequest(`/blocks/${PAGES.VENTURE_PROTOCOL}/children`);
  
  const databases = blocks.results.filter(b => b.type === 'child_database');
  
  const content = {
    calendar: [],
    guests: [],
    scripts: []
  };
  
  for (const db of databases) {
    const query = await notionRequest(`/databases/${db.id}/query`, 'POST');
    const title = db.child_database?.title || 'Unknown';
    
    if (title.toLowerCase().includes('calendar')) {
      content.calendar = query.results;
    } else if (title.toLowerCase().includes('guest')) {
      content.guests = query.results;
    } else if (title.toLowerCase().includes('script')) {
      content.scripts = query.results;
    }
  }
  
  return content;
}

// Push daily briefing to Notion
async function pushDailyBriefing(date, data) {
  const { news, posts, metrics } = data;
  
  // Create page under Mission Control
  const page = await notionRequest('/pages', 'POST', {
    parent: { page_id: PAGES.MISSION_CONTROL },
    properties: {
      title: {
        title: [{ text: { content: `Daily Briefing — ${date}` } }]
      }
    },
    children: [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: 'News & Insights' } }] }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content: news || 'No news updates' } }] }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: 'Content Posts' } }] }
      },
      ...posts.map(post => ({
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ text: { content: post.text } }],
          icon: { emoji: '📝' }
        }
      })),
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: 'Metrics' } }] }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content: JSON.stringify(metrics, null, 2) } }] }
      }
    ]
  });
  
  return page;
}

// Push content post to Venture Protocol
async function pushContentPost(post) {
  // Find the content database under Venture Protocol
  const blocks = await notionRequest(`/blocks/${PAGES.VENTURE_PROTOCOL}/children`);
  const contentDB = blocks.results.find(b => 
    b.type === 'child_database' && 
    (b.child_database?.title?.toLowerCase().includes('content') ||
     b.child_database?.title?.toLowerCase().includes('post'))
  );
  
  if (!contentDB) {
    console.error('No content database found in Venture Protocol');
    return null;
  }
  
  const page = await notionRequest('/pages', 'POST', {
    parent: { database_id: contentDB.id },
    properties: {
      Name: {
        title: [{ text: { content: post.title || `Post ${new Date().toISOString().split('T')[0]}` } }]
      },
      // Add more properties based on database schema
    }
  });
  
  return page;
}

module.exports = {
  getVentureProtocolContent,
  pushDailyBriefing,
  pushContentPost
};
