/**
 * Mission Control API — Cloudflare Pages Function
 * Handles all backend operations via /api/* routes
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, ''); // Remove /api prefix
  const method = request.method;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============ CALENDAR API ============
    
    // GET /api/calendar/:date
    if (method === 'GET' && path.match(/^\/calendar\/\d{4}-\d{2}-\d{2}$/)) {
      const date = path.split('/').pop();
      const results = await env.DB.prepare(
        'SELECT * FROM calendar_user_data WHERE date = ? ORDER BY post_index'
      ).bind(date).all();
      
      return jsonResponse(results.results || [], corsHeaders);
    }

    // PUT /api/calendar/:date/:postIndex
    if (method === 'PUT' && path.match(/^\/calendar\/\d{4}-\d{2}-\d{2}\/\d+$/)) {
      const parts = path.split('/');
      const postIndex = parseInt(parts.pop());
      const date = parts.pop();
      const data = await request.json();
      
      await env.DB.prepare(`
        INSERT INTO calendar_user_data 
        (date, post_index, final_text, post_url, views, likes, comments, reposts, saves, clicks, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(date, post_index) DO UPDATE SET
          final_text = excluded.final_text,
          post_url = excluded.post_url,
          views = excluded.views,
          likes = excluded.likes,
          comments = excluded.comments,
          reposts = excluded.reposts,
          saves = excluded.saves,
          clicks = excluded.clicks,
          updated_at = datetime('now')
      `).bind(
        date, 
        postIndex,
        data.final_text || '',
        data.post_url || '',
        data.views || 0,
        data.likes || 0,
        data.comments || 0,
        data.reposts || 0,
        data.saves || 0,
        data.clicks || 0
      ).run();
      
      return jsonResponse({ success: true, date, postIndex }, corsHeaders);
    }

    // GET /api/calendar/all
    if (method === 'GET' && path === '/calendar/all') {
      const results = await env.DB.prepare(
        'SELECT * FROM calendar_user_data ORDER BY date DESC, post_index'
      ).all();
      
      return jsonResponse(results.results || [], corsHeaders);
    }

    // ============ JOBS API ============
    
    // GET /api/jobs
    if (method === 'GET' && path === '/jobs') {
      const results = await env.DB.prepare(
        'SELECT * FROM job_statuses ORDER BY updated_at DESC'
      ).all();
      
      return jsonResponse(results.results || [], corsHeaders);
    }

    // PUT /api/jobs/:jobId
    if (method === 'PUT' && path.match(/^\/jobs\/.+$/)) {
      const jobId = path.split('/').pop();
      const data = await request.json();
      
      await env.DB.prepare(`
        INSERT INTO job_statuses (job_id, status, notes, updated_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(job_id) DO UPDATE SET
          status = excluded.status,
          notes = excluded.notes,
          updated_at = datetime('now')
      `).bind(
        jobId,
        data.status || '',
        data.notes || ''
      ).run();
      
      return jsonResponse({ success: true, jobId }, corsHeaders);
    }

    // ============ KANBAN API ============
    
    // GET /api/kanban
    if (method === 'GET' && path === '/kanban') {
      const results = await env.DB.prepare(
        'SELECT * FROM kanban_tasks ORDER BY position, updated_at'
      ).all();
      
      return jsonResponse(results.results || [], corsHeaders);
    }

    // PUT /api/kanban/:id
    if (method === 'PUT' && path.match(/^\/kanban\/.+$/)) {
      const id = decodeURIComponent(path.split('/').pop());
      const data = await request.json();
      
      await env.DB.prepare(`
        INSERT INTO kanban_tasks (id, title, col, position, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          col = excluded.col,
          position = excluded.position,
          updated_at = datetime('now')
      `).bind(
        id,
        data.title || '',
        data.col || 'todo',
        data.position || 0
      ).run();
      
      return jsonResponse({ success: true, id }, corsHeaders);
    }

    // DELETE /api/kanban/:id
    if (method === 'DELETE' && path.match(/^\/kanban\/.+$/)) {
      const id = decodeURIComponent(path.split('/').pop());
      
      await env.DB.prepare('DELETE FROM kanban_tasks WHERE id = ?').bind(id).run();
      
      return jsonResponse({ success: true, id }, corsHeaders);
    }

    // ============ NOTES API ============
    
    // GET /api/notes/:key
    if (method === 'GET' && path.match(/^\/notes\/.+$/)) {
      const key = decodeURIComponent(path.split('/').pop());
      const result = await env.DB.prepare(
        'SELECT value FROM user_notes WHERE key = ?'
      ).bind(key).first();
      
      return jsonResponse({ 
        key, 
        value: result?.value || '' 
      }, corsHeaders);
    }

    // PUT /api/notes/:key
    if (method === 'PUT' && path.match(/^\/notes\/.+$/)) {
      const key = decodeURIComponent(path.split('/').pop());
      const data = await request.json();
      
      await env.DB.prepare(`
        INSERT INTO user_notes (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now')
      `).bind(key, data.value || '').run();
      
      return jsonResponse({ success: true, key }, corsHeaders);
    }

    // ============ HEALTH CHECK ============
    
    if (path === '/health' || path === '/') {
      return jsonResponse({ 
        status: 'ok', 
        service: 'mission-control-api',
        timestamp: new Date().toISOString()
      }, corsHeaders);
    }

    // 404
    return jsonResponse({ error: 'Not found', path }, corsHeaders, 404);

  } catch (error) {
    console.error('API Error:', error);
    return jsonResponse({ 
      error: 'Internal server error', 
      message: error.message 
    }, corsHeaders, 500);
  }
}

function jsonResponse(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}
