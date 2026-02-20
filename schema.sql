CREATE TABLE calendar_user_data (
  date TEXT NOT NULL,
  post_index INTEGER NOT NULL,
  final_text TEXT DEFAULT '',
  post_url TEXT DEFAULT '',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (date, post_index)
);

CREATE TABLE job_statuses (
  job_id TEXT PRIMARY KEY,
  status TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE kanban_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  col TEXT DEFAULT 'todo',
  position INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE user_notes (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);
