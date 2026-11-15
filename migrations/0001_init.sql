CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  author TEXT NOT NULL,
  article TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  ip_hash TEXT,
  client_id TEXT,
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'legacy')),
  CHECK (length(trim(author)) BETWEEN 1 AND 64),
  CHECK (length(trim(article)) BETWEEN 1 AND 4000)
);

CREATE UNIQUE INDEX idx_comments_client_id
  ON comments(client_id)
  WHERE client_id IS NOT NULL;

CREATE INDEX idx_comments_created_at
  ON comments(created_at DESC, id DESC);

CREATE INDEX idx_comments_ip_hash
  ON comments(ip_hash, created_at DESC);
