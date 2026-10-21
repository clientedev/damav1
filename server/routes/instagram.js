const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { authMiddleware } = require('../auth');

router.use(authMiddleware);

// GET all Instagram posts
router.get('/', async (req, res) => {
  try {
    const posts = await all('SELECT * FROM instagram_posts ORDER BY order_index ASC');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar posts do Instagram.' });
  }
});

// Helper to extract Instagram post permalink from embed HTML or raw string
function extractInstagramUrl(rawInput) {
  if (!rawInput) return null;
  const match = rawInput.match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i);
  if (match) {
    return `https://www.instagram.com/p/${match[1]}/`;
  }
  return null;
}

// Helper to extract nice profile name / author from Instagram embed code
function extractAuthorFromEmbed(embedHtml) {
  if (!embedHtml) return null;
  const match = embedHtml.match(/(?:Uma publicação (?:partilhada|compartilhada) por|A post shared by)\s+([^<]+)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  const handleMatch = embedHtml.match(/@([a-zA-Z0-9_.]+)/);
  if (handleMatch) {
    return `Publicação de ${handleMatch[0]}`;
  }
  return null;
}

// POST add Instagram post
router.post('/', async (req, res) => {
  let { post_url, title, category, embed_html, image_url } = req.body;

  // If user pasted embed code into post_url, move it to embed_html
  if (post_url && (post_url.includes('<blockquote') || post_url.includes('<iframe'))) {
    if (!embed_html) embed_html = post_url;
  }

  // If post_url is missing or is embed HTML, try to extract clean Instagram URL
  const extractedUrl = extractInstagramUrl(post_url) || extractInstagramUrl(embed_html);
  if (extractedUrl) {
    post_url = extractedUrl;
  }

  if (!post_url && !embed_html) {
    return res.status(400).json({ error: 'Informe o link da publicação ou o código de incorporação (embed) do Instagram.' });
  }

  if (!post_url) {
    post_url = 'https://www.instagram.com/g11conceitofinanceiro/';
  }

  // Automatically extract nice profile / author title from embed HTML
  if (!title || title.startsWith('Publicação Instagram')) {
    const niceAuthor = extractAuthorFromEmbed(embed_html);
    if (niceAuthor) {
      title = niceAuthor;
    } else if (!title) {
      title = 'Publicação do Instagram';
    }
  }

  try {
    const maxOrderRow = await get('SELECT MAX(order_index) as maxOrder FROM instagram_posts');
    const orderIndex = (maxOrderRow?.maxOrder || 0) + 1;

    let cleanUrl = post_url.trim();
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const result = await run(
      `INSERT INTO instagram_posts (post_url, title, category, embed_html, image_url, order_index, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [cleanUrl, title, category || 'Geral', embed_html || '', image_url || '', orderIndex]
    );

    const newPost = await get('SELECT * FROM instagram_posts WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Publicação cadastrada com sucesso.', post: newPost });
  } catch (err) {
    console.error('Error inserting Instagram post:', err);
    res.status(500).json({ error: 'Erro ao cadastrar publicação do Instagram: ' + err.message });
  }
});

// PUT update Instagram post
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  let { post_url, title, category, embed_html, image_url, is_active } = req.body;

  if (post_url && (post_url.includes('<blockquote') || post_url.includes('<iframe'))) {
    if (!embed_html) embed_html = post_url;
  }

  const extractedUrl = extractInstagramUrl(post_url) || extractInstagramUrl(embed_html);
  if (extractedUrl) {
    post_url = extractedUrl;
  }

  if (embed_html && (!title || title.startsWith('Publicação Instagram'))) {
    const niceAuthor = extractAuthorFromEmbed(embed_html);
    if (niceAuthor) title = niceAuthor;
  }

  try {
    await run(
      `UPDATE instagram_posts
       SET post_url = coalesce(?, post_url),
           title = coalesce(?, title),
           category = coalesce(?, category),
           embed_html = coalesce(?, embed_html),
           image_url = coalesce(?, image_url),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [post_url, title, category, embed_html, image_url, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );

    const updated = await get('SELECT * FROM instagram_posts WHERE id = ?', [id]);
    res.json({ message: 'Publicação atualizada com sucesso.', post: updated });
  } catch (err) {
    console.error('Error updating Instagram post:', err);
    res.status(500).json({ error: 'Erro ao atualizar publicação do Instagram: ' + err.message });
  }
});

// DELETE Instagram post
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM instagram_posts WHERE id = ?', [id]);
    res.json({ message: 'Publicação removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir publicação.' });
  }
});

// PUT reorder Instagram posts
router.put('/reorder', async (req, res) => {
  const { postIds } = req.body;
  if (!Array.isArray(postIds)) {
    return res.status(400).json({ error: 'postIds deve ser uma lista de IDs.' });
  }

  try {
    for (let index = 0; index < postIds.length; index++) {
      await run('UPDATE instagram_posts SET order_index = ? WHERE id = ?', [index, postIds[index]]);
    }
    res.json({ message: 'Ordem das publicações atualizada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao reordenar publicações.' });
  }
});

module.exports = router;
