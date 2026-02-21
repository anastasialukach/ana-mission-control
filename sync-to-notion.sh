#!/bin/bash
# Sync Mission Control data to Notion

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_SCRIPT="$SCRIPT_DIR/sync-notion.js"

# Check if calendar-data.js has today's briefing
TODAY=$(date -u +%Y-%m-%d)

# Extract today's briefing from calendar-data.js
BRIEFING=$(node -e "
const data = require('$SCRIPT_DIR/calendar-data.js');
const today = data.find(d => d.date === '$TODAY');
if (today) {
  console.log(JSON.stringify({
    date: today.date,
    data: {
      news: today.news || '',
      posts: today.posts || [],
      metrics: today.metrics || {}
    }
  }));
}
")

if [ -n "$BRIEFING" ]; then
  # Push to Notion
  node -e "
  const sync = require('$NODE_SCRIPT');
  const briefing = $BRIEFING;
  sync.pushDailyBriefing(briefing.date, briefing.data)
    .then(() => console.log('✓ Briefing synced to Notion'))
    .catch(err => console.error('✗ Sync failed:', err));
  "
fi
