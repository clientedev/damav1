const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { authMiddleware } = require('../auth');

router.use(authMiddleware);

// GET all albums with photo counts
router.get('/', async (req, res) => {
  try {
    const albums = await all('SELECT * FROM albums ORDER BY order_index ASC');
    const albumsWithPhotos = await Promise.all(
      albums.map(async (alb) => {
        const photos = await all('SELECT * FROM photos WHERE album_id = ? ORDER BY order_index ASC', [alb.id]);
        return {
          ...alb,
          photo_count: photos.length,
          photos
        };
      })
    );
    res.json(albumsWithPhotos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar lista de álbuns.' });
  }
});

// POST create album
router.post('/', async (req, res) => {
  const { title, destination, category, year, cover_image, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'O título do álbum é obrigatório.' });
  }

  try {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    const maxOrderRow = await get('SELECT MAX(order_index) as maxOrder FROM albums');
    const orderIndex = (maxOrderRow?.maxOrder || 0) + 1;

    const result = await run(
      `INSERT INTO albums (slug, title, destination, category, year, cover_image, description, order_index, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        slug,
        title,
        destination || '',
        category || 'Viagens',
        year || new Date().getFullYear().toString(),
        cover_image || '',
        description || '',
        orderIndex
      ]
    );

    const newAlbum = await get('SELECT * FROM albums WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Álbum criado com sucesso.', album: { ...newAlbum, photos: [] } });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar álbum.' });
  }
});

// PUT update album
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, destination, category, year, cover_image, description, is_active } = req.body;

  try {
    await run(
      `UPDATE albums
       SET title = coalesce(?, title),
           destination = coalesce(?, destination),
           category = coalesce(?, category),
           year = coalesce(?, year),
           cover_image = coalesce(?, cover_image),
           description = coalesce(?, description),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [title, destination, category, year, cover_image, description, is_active !== undefined ? (is_active ? 1 : 0) : null, id]
    );

    const updated = await get('SELECT * FROM albums WHERE id = ?', [id]);
    res.json({ message: 'Álbum atualizado com sucesso.', album: updated });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar álbum.' });
  }
});

// DELETE album and its photos
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM photos WHERE album_id = ?', [id]);
    await run('DELETE FROM albums WHERE id = ?', [id]);
    res.json({ message: 'Álbum e suas fotos excluídos com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir álbum.' });
  }
});

// POST add photo to album
router.post('/:id/photos', async (req, res) => {
  const { id } = req.params;
  const { url, title, alt_text, caption, width, height } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL da foto é obrigatória.' });
  }

  try {
    const maxOrderRow = await get('SELECT MAX(order_index) as maxOrder FROM photos WHERE album_id = ?', [id]);
    const orderIndex = (maxOrderRow?.maxOrder || 0) + 1;

    const result = await run(
      `INSERT INTO photos (album_id, url, title, alt_text, caption, width, height, order_index, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, url, title || '', alt_text || title || 'Foto do álbum', caption || '', width || null, height || null, orderIndex]
    );

    const newPhoto = await get('SELECT * FROM photos WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Foto adicionada com sucesso.', photo: newPhoto });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar foto ao álbum.' });
  }
});

// PUT update photo metadata
router.put('/photos/:photoId', async (req, res) => {
  const { photoId } = req.params;
  const { title, alt_text, caption, is_active } = req.body;

  try {
    await run(
      `UPDATE photos
       SET title = coalesce(?, title),
           alt_text = coalesce(?, alt_text),
           caption = coalesce(?, caption),
           is_active = coalesce(?, is_active)
       WHERE id = ?`,
      [title, alt_text, caption, is_active !== undefined ? (is_active ? 1 : 0) : null, photoId]
    );

    const updated = await get('SELECT * FROM photos WHERE id = ?', [photoId]);
    res.json({ message: 'Foto atualizada com sucesso.', photo: updated });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar foto.' });
  }
});

// DELETE photo
router.delete('/photos/:photoId', async (req, res) => {
  const { photoId } = req.params;
  try {
    await run('DELETE FROM photos WHERE id = ?', [photoId]);
    res.json({ message: 'Foto removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir foto.' });
  }
});

// PUT reorder photos within an album
router.put('/:id/photos-reorder', async (req, res) => {
  const { id } = req.params;
  const { photoIds } = req.body;
  if (!Array.isArray(photoIds)) {
    return res.status(400).json({ error: 'photoIds deve ser uma lista de IDs.' });
  }

  try {
    for (let index = 0; index < photoIds.length; index++) {
      await run('UPDATE photos SET order_index = ? WHERE id = ? AND album_id = ?', [index, photoIds[index], id]);
    }
    res.json({ message: 'Ordem das fotos atualizada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao reordenar fotos.' });
  }
});

module.exports = router;
