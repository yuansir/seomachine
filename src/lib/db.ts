import Database from '@tauri-apps/plugin-sql';

// ────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────

export interface DBArticle {
  id: string;
  title: string;
  content: string;
  briefId?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  wordpressUrl?: string;
}

export interface DBResearchResult {
  id: string;
  topic: string;
  researchType: string;
  content: string;
  createdAt: string;
}

// ────────────────────────────────────────────
//  Connection singleton
// ────────────────────────────────────────────

let _db: Database | null = null;

async function getDB(): Promise<Database> {
  if (!_db) {
    _db = await Database.load('sqlite:seomachine.db');
  }
  return _db;
}

// ────────────────────────────────────────────
//  Article helpers
// ────────────────────────────────────────────

interface ArticleRow {
  id: number;
  title: string;
  content: string;
  status: string;
  research_id: number | null;
  created_at: string;
  updated_at: string;
  wordpress_url: string | null;
}

function rowToArticle(row: ArticleRow): DBArticle {
  return {
    id: String(row.id),
    title: row.title,
    content: row.content,
    status: row.status as 'draft' | 'published',
    briefId: row.research_id != null ? String(row.research_id) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    wordpressUrl: row.wordpress_url ?? undefined,
  };
}

export async function saveArticleToDB(article: {
  id?: string;
  title: string;
  content: string;
  status?: string;
  briefId?: string;
}): Promise<string> {
  const db = await getDB();
  const isNumericId = article.id && /^\d+$/.test(article.id);

  if (isNumericId) {
    await db.execute(
      `UPDATE articles
          SET title = ?, content = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [article.title, article.content, article.status ?? 'draft', Number(article.id)],
    );
    return article.id!;
  }

  const result = await db.execute(
    `INSERT INTO articles (title, content, status, research_id)
     VALUES (?, ?, ?, ?)`,
    [
      article.title,
      article.content,
      article.status ?? 'draft',
      article.briefId ? Number(article.briefId) : null,
    ],
  );
  return String(result.lastInsertId);
}

export async function listArticlesFromDB(): Promise<DBArticle[]> {
  const db = await getDB();
  const rows = await db.select<ArticleRow[]>(
    `SELECT * FROM articles ORDER BY updated_at DESC`,
  );
  return rows.map(rowToArticle);
}

export async function getArticleFromDB(id: string): Promise<DBArticle | null> {
  const db = await getDB();
  const rows = await db.select<ArticleRow[]>(
    `SELECT * FROM articles WHERE id = ?`,
    [Number(id)],
  );
  return rows.length > 0 ? rowToArticle(rows[0]) : null;
}

export async function deleteArticleFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.execute(`DELETE FROM articles WHERE id = ?`, [Number(id)]);
}

export async function markArticlePublished(
  id: string,
  wordpressUrl: string,
): Promise<void> {
  const db = await getDB();
  await db.execute(
    `UPDATE articles
        SET status = 'published', published_at = CURRENT_TIMESTAMP, wordpress_url = ?
      WHERE id = ?`,
    [wordpressUrl, Number(id)],
  );
}

// ────────────────────────────────────────────
//  Research helpers
// ────────────────────────────────────────────

interface ResearchRow {
  id: number;
  topic: string;
  research_type: string;
  content: string;
  created_at: string;
}

export async function saveResearchToDB(params: {
  topic: string;
  type: string;
  content: string;
}): Promise<string> {
  const db = await getDB();
  const result = await db.execute(
    `INSERT INTO researches (topic, research_type, content) VALUES (?, ?, ?)`,
    [params.topic, params.type, params.content],
  );
  return String(result.lastInsertId);
}

export async function listResearchFromDB(): Promise<DBResearchResult[]> {
  const db = await getDB();
  const rows = await db.select<ResearchRow[]>(
    `SELECT * FROM researches ORDER BY created_at DESC`,
  );
  return rows.map((row) => ({
    id: String(row.id),
    topic: row.topic,
    researchType: row.research_type,
    content: row.content,
    createdAt: row.created_at,
  }));
}
