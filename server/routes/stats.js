const express = require('express');
const router = express.Router();
const { get } = require('../db');
const { authMiddleware } = require('../auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const albumsCount = (await get('SELECT COUNT(*) as count FROM albums'))?.count || 0;
    const photosCount = (await get('SELECT COUNT(*) as count FROM photos'))?.count || 0;
    const heroSlidesCount = (await get('SELECT COUNT(*) as count FROM hero_slides WHERE is_active = 1'))?.count || 0;
    const productsCount = (await get('SELECT COUNT(*) as count FROM products WHERE is_active = 1'))?.count || 0;
    const testimonialsCount = (await get('SELECT COUNT(*) as count FROM testimonials WHERE is_active = 1'))?.count || 0;
    const instagramCount = (await get('SELECT COUNT(*) as count FROM instagram_posts WHERE is_active = 1'))?.count || 0;

    res.json({
      albumsCount,
      photosCount,
      heroSlidesCount,
      productsCount,
      testimonialsCount,
      instagramCount,
      databaseType: 'SQLite (Persistent Storage)',
      status: 'Operacional'
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao calcular métricas do sistema.' });
  }
});

module.exports = router;
