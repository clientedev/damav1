const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../auth');

router.use(authMiddleware);

const uploadsBaseDir = path.join(__dirname, '..', '..', 'uploads');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = req.query.folder || 'geral';
    const targetDir = path.join(uploadsBaseDir, subfolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const cleanOriginalName = file.originalname
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${uniqueSuffix}_${cleanOriginalName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|svg|mp4/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowedTypes.test(ext) || allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Apenas imagens e vídeos MP4 são suportados.'));
    }
  }
});

// Helper to sync uploaded files to client/public/uploads if it exists
function syncToClientPublic(sourcePath, subfolder, filename) {
  try {
    const clientPublicDir = path.join(__dirname, '..', '..', 'client', 'public', 'uploads', subfolder);
    if (!fs.existsSync(clientPublicDir)) {
      fs.mkdirSync(clientPublicDir, { recursive: true });
    }
    fs.copyFileSync(sourcePath, path.join(clientPublicDir, filename));
  } catch (err) {
    console.error('Warning: could not sync to client/public/uploads:', err.message);
  }
}

// POST upload single file
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const subfolder = req.query.folder || 'geral';
  syncToClientPublic(req.file.path, subfolder, req.file.filename);
  const fileUrl = `/uploads/${subfolder}/${req.file.filename}`.replace(/\\/g, '/');

  res.status(201).json({
    message: 'Upload realizado com sucesso.',
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

// POST upload multiple files
router.post('/upload-multiple', upload.array('files', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const subfolder = req.query.folder || 'geral';
  const uploadedFiles = req.files.map((f) => {
    syncToClientPublic(f.path, subfolder, f.filename);
    return {
      url: `/uploads/${subfolder}/${f.filename}`.replace(/\\/g, '/'),
      filename: f.filename,
      size: f.size
    };
  });

  res.status(201).json({
    message: `${uploadedFiles.length} arquivos enviados com sucesso.`,
    files: uploadedFiles
  });
});

// GET list all media in uploads
router.get('/', (req, res) => {
  try {
    const mediaList = [];

    function scanDir(dir) {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else {
          const relPath = path.relative(uploadsBaseDir, fullPath).replace(/\\/g, '/');
          mediaList.push({
            url: `/uploads/${relPath}`,
            filename: file,
            relPath,
            size: stat.size,
            updatedAt: stat.mtime
          });
        }
      }
    }

    scanDir(uploadsBaseDir);
    mediaList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json(mediaList);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar arquivos de mídia.' });
  }
});

module.exports = router;
