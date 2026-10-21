const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { authMiddleware } = require('../auth');

// All endpoints in this router require authentication
router.use(authMiddleware);

// GET hero settings and slides
router.get('/', async (req, res) => {
  try {
    const heroConfigRow = await get('SELECT value FROM site_settings WHERE key = ?', ['hero_config']);
    const slides = await all('SELECT * FROM hero_slides ORDER BY order_index ASC');
    res.json({
      config: heroConfigRow ? JSON.parse(heroConfigRow.value) : {},
      slides
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter configurações da hero section.' });
  }
});

// PUT update hero settings
router.put('/config', async (req, res) => {
  try {
    const config = req.body;
    await run(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ('hero_config', ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(config)]
    );
    res.json({ message: 'Configurações da Hero Section atualizadas com sucesso.', config });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar configurações da hero.' });
  }
});

// POST add new slide
router.post('/slides', async (req, res) => {
  const { image_desktop, image_mobile, title, subtitle } = req.body;
  if (!image_desktop) {
    return res.status(400).json({ error: 'A imagem principal do slide é obrigatória.' });
  }

  try {
    const maxOrderRow = await get('SELECT MAX(order_index) as maxOrder FROM hero_slides');
    const newOrder = (maxOrderRow?.maxOrder || 0) + 1;

    const result = await run(
      `INSERT INTO hero_slides (image_desktop, image_mobile, title, subtitle, order_index, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [image_desktop, image_mobile || image_desktop, title || '', subtitle || '', newOrder]
    );

    const newSlide = await get('SELECT * FROM hero_slides WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Slide adicionado com sucesso.', slide: newSlide });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar slide.' });
  }
});

// PUT update slide
router.put('/slides/:id', async (req, res) => {
  const { id } = req.params;
  const { image_desktop, image_mobile, title, subtitle, is_active } = req.body;

  try {
    await run(
      `UPDATE hero_slides
       SET image_desktop = coalesce(?, image_desktop),
           image_mobile = coalesce(?, image_mobile),
           title = coalesce(?, title),
           subtitle = coalesce(?, subtitle),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [image_desktop, image_mobile, title, subtitle, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );

    const updated = await get('SELECT * FROM hero_slides WHERE id = ?', [id]);
    res.json({ message: 'Slide atualizado com sucesso.', slide: updated });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar slide.' });
  }
});

// DELETE slide
router.delete('/slides/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM hero_slides WHERE id = ?', [id]);
    res.json({ message: 'Slide removido com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir slide.' });
  }
});

// PUT reorder slides
router.put('/slides-reorder', async (req, res) => {
  const { slideIds } = req.body; // array of IDs in new order
  if (!Array.isArray(slideIds)) {
    return res.status(400).json({ error: 'slideIds deve ser uma lista de IDs.' });
  }

  try {
    for (let index = 0; index < slideIds.length; index++) {
      await run('UPDATE hero_slides SET order_index = ? WHERE id = ?', [index, slideIds[index]]);
    }
    res.json({ message: 'Ordem dos slides atualizada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao reordenar slides.' });
  }
});

module.exports = router;
