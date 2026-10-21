const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { authMiddleware } = require('../auth');

router.use(authMiddleware);

// GET all content sections
router.get('/', async (req, res) => {
  try {
    const aboutRow = await get('SELECT value FROM site_settings WHERE key = ?', ['about_content']);
    const products = await all('SELECT * FROM products ORDER BY order_index ASC');
    const benefits = await all('SELECT * FROM exclusive_benefits ORDER BY order_index ASC');
    const testimonials = await all('SELECT * FROM testimonials ORDER BY order_index ASC');
    const claims = await all('SELECT * FROM claims_faq ORDER BY order_index ASC');

    res.json({
      about: aboutRow ? JSON.parse(aboutRow.value) : {},
      products: products.map((p) => ({ ...p, features: p.features_json ? JSON.parse(p.features_json) : [] })),
      benefits,
      testimonials,
      claims: claims.map((c) => ({ ...c, steps: c.steps_json ? JSON.parse(c.steps_json) : [] }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar conteúdos das seções.' });
  }
});

// PUT update About section
router.put('/about', async (req, res) => {
  try {
    const content = req.body;
    await run(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ('about_content', ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(content)]
    );
    res.json({ message: 'Seção Sobre atualizada com sucesso.', about: content });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar seção Sobre.' });
  }
});

// Products CRUD
router.post('/products', async (req, res) => {
  const { title, tag, description, card_image, features } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Título e descrição são obrigatórios.' });
  }

  try {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-') + '-' + Date.now();

    const maxOrder = (await get('SELECT MAX(order_index) as m FROM products'))?.m || 0;

    const result = await run(
      `INSERT INTO products (slug, title, tag, description, card_image, features_json, order_index, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [slug, title, tag || '', description, card_image || '', JSON.stringify(features || []), maxOrder + 1]
    );

    const newProd = await get('SELECT * FROM products WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Produto cadastrado.', product: { ...newProd, features: features || [] } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar produto.' });
  }
});

router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { title, tag, description, card_image, features, is_active } = req.body;

  try {
    await run(
      `UPDATE products
       SET title = coalesce(?, title),
           tag = coalesce(?, tag),
           description = coalesce(?, description),
           card_image = coalesce(?, card_image),
           features_json = coalesce(?, features_json),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [title, tag, description, card_image, features ? JSON.stringify(features) : null, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );

    const updated = await get('SELECT * FROM products WHERE id = ?', [id]);
    res.json({ message: 'Produto atualizado.', product: { ...updated, features: updated.features_json ? JSON.parse(updated.features_json) : [] } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Produto removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover produto.' });
  }
});

// Exclusive Benefits CRUD
router.post('/benefits', async (req, res) => {
  const { title, description, icon } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Título e descrição são obrigatórios.' });
  }

  try {
    const maxOrder = (await get('SELECT MAX(order_index) as m FROM exclusive_benefits'))?.m || 0;
    const result = await run(
      `INSERT INTO exclusive_benefits (title, description, icon, order_index, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [title, description, icon || 'ShieldCheck', maxOrder + 1]
    );
    const newBen = await get('SELECT * FROM exclusive_benefits WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Benefício cadastrado.', benefit: newBen });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar benefício.' });
  }
});

router.put('/benefits/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, icon, is_active } = req.body;

  try {
    await run(
      `UPDATE exclusive_benefits
       SET title = coalesce(?, title),
           description = coalesce(?, description),
           icon = coalesce(?, icon),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [title, description, icon, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );
    const updated = await get('SELECT * FROM exclusive_benefits WHERE id = ?', [id]);
    res.json({ message: 'Benefício atualizado.', benefit: updated });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar benefício.' });
  }
});

router.delete('/benefits/:id', async (req, res) => {
  try {
    await run('DELETE FROM exclusive_benefits WHERE id = ?', [req.params.id]);
    res.json({ message: 'Benefício removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover benefício.' });
  }
});

// Testimonials CRUD
router.post('/testimonials', async (req, res) => {
  const { name, role, quote, stars, avatar } = req.body;
  if (!name || !quote) {
    return res.status(400).json({ error: 'Nome e depoimento são obrigatórios.' });
  }

  try {
    const maxOrder = (await get('SELECT MAX(order_index) as m FROM testimonials'))?.m || 0;
    const result = await run(
      `INSERT INTO testimonials (name, role, quote, stars, avatar, order_index, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name, role || 'Cliente', quote, stars || 5, avatar || '', maxOrder + 1]
    );
    const newTest = await get('SELECT * FROM testimonials WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Depoimento cadastrado.', testimonial: newTest });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar depoimento.' });
  }
});

router.put('/testimonials/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, quote, stars, avatar, is_active } = req.body;

  try {
    await run(
      `UPDATE testimonials
       SET name = coalesce(?, name),
           role = coalesce(?, role),
           quote = coalesce(?, quote),
           stars = coalesce(?, stars),
           avatar = coalesce(?, avatar),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [name, role, quote, stars, avatar, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );
    const updated = await get('SELECT * FROM testimonials WHERE id = ?', [id]);
    res.json({ message: 'Depoimento atualizado.', testimonial: updated });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar depoimento.' });
  }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    await run('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Depoimento removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover depoimento.' });
  }
});

// Claims FAQ CRUD
router.put('/claims/:id', async (req, res) => {
  const { id } = req.params;
  const { question, answer, steps, is_active } = req.body;

  try {
    await run(
      `UPDATE claims_faq
       SET question = coalesce(?, question),
           answer = coalesce(?, answer),
           steps_json = coalesce(?, steps_json),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [question, answer, steps ? JSON.stringify(steps) : null, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );
    const updated = await get('SELECT * FROM claims_faq WHERE id = ?', [id]);
    res.json({ message: 'Item de sinistro atualizado.', claim: { ...updated, steps: updated.steps_json ? JSON.parse(updated.steps_json) : [] } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar item de sinistro.' });
  }
});

module.exports = router;
