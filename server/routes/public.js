const express = require('express');
const router = express.Router();
const { get, all } = require('../db');

// Main public bundle endpoint: returns complete site data for seamless rendering
router.get('/site-data', async (req, res) => {
  try {
    const heroConfigRow = await get('SELECT value FROM site_settings WHERE key = ?', ['hero_config']);
    const generalSettingsRow = await get('SELECT value FROM site_settings WHERE key = ?', ['general_settings']);
    const aboutContentRow = await get('SELECT value FROM site_settings WHERE key = ?', ['about_content']);
    const sectionsOrderRow = await get('SELECT value FROM site_settings WHERE key = ?', ['sections_order']);

    const heroSlides = await all('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY order_index ASC');
    const albums = await all('SELECT * FROM albums WHERE is_active = 1 ORDER BY order_index ASC');
    const products = await all('SELECT * FROM products WHERE is_active = 1 ORDER BY order_index ASC');
    const benefits = await all('SELECT * FROM exclusive_benefits WHERE is_active = 1 ORDER BY order_index ASC');
    const testimonials = await all('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY order_index ASC');
    const claims = await all('SELECT * FROM claims_faq WHERE is_active = 1 ORDER BY order_index ASC');
    const instagram = await all('SELECT * FROM instagram_posts WHERE is_active = 1 ORDER BY order_index ASC');

    // Get photo counts and sample photos for each album
    const albumsWithPhotos = await Promise.all(
      albums.map(async (alb) => {
        const photos = await all(
          'SELECT id, url, title, alt_text, caption, width, height, order_index FROM photos WHERE album_id = ? AND is_active = 1 ORDER BY order_index ASC',
          [alb.id]
        );
        return {
          ...alb,
          photo_count: photos.length,
          photos
        };
      })
    );

    const productsFormatted = products.map((p) => ({
      ...p,
      features: p.features_json ? JSON.parse(p.features_json) : []
    }));

    const claimsFormatted = claims.map((c) => ({
      ...c,
      steps: c.steps_json ? JSON.parse(c.steps_json) : []
    }));

    res.json({
      hero: {
        config: heroConfigRow ? JSON.parse(heroConfigRow.value) : {},
        slides: heroSlides
      },
      settings: generalSettingsRow ? JSON.parse(generalSettingsRow.value) : {},
      about: aboutContentRow ? JSON.parse(aboutContentRow.value) : {},
      albums: albumsWithPhotos,
      products: productsFormatted,
      benefits,
      testimonials,
      claims: claimsFormatted,
      instagram,
      sections_order: sectionsOrderRow ? JSON.parse(sectionsOrderRow.value) : undefined
    });
  } catch (err) {
    console.error('Error fetching public site data:', err);
    res.status(500).json({ error: 'Erro ao carregar dados públicos do site.' });
  }
});

// Get all active albums
router.get('/albums', async (req, res) => {
  try {
    const albums = await all('SELECT * FROM albums WHERE is_active = 1 ORDER BY order_index ASC');
    const albumsWithCounts = await Promise.all(
      albums.map(async (alb) => {
        const countRow = await get('SELECT COUNT(*) as count FROM photos WHERE album_id = ? AND is_active = 1', [alb.id]);
        return {
          ...alb,
          photo_count: countRow ? countRow.count : 0
        };
      })
    );
    res.json(albumsWithCounts);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar álbuns.' });
  }
});

// Get single album with all photos
router.get('/albums/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let album;
    if (isNaN(idOrSlug)) {
      album = await get('SELECT * FROM albums WHERE slug = ? AND is_active = 1', [idOrSlug]);
    } else {
      album = await get('SELECT * FROM albums WHERE id = ? AND is_active = 1', [idOrSlug]);
    }

    if (!album) {
      return res.status(404).json({ error: 'Álbum não encontrado.' });
    }

    const photos = await all(
      'SELECT * FROM photos WHERE album_id = ? AND is_active = 1 ORDER BY order_index ASC',
      [album.id]
    );

    res.json({
      ...album,
      photos
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar fotos do álbum.' });
  }
});

module.exports = router;
