const express = require('express');
const router = express.Router();
const { run, get } = require('../db');
const { authMiddleware } = require('../auth');

router.use(authMiddleware);

// GET general settings
router.get('/', async (req, res) => {
  try {
    const settingsRow = await get('SELECT value FROM site_settings WHERE key = ?', ['general_settings']);
    res.json(settingsRow ? JSON.parse(settingsRow.value) : {});
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter configurações gerais.' });
  }
});

// PUT update general settings
router.put('/', async (req, res) => {
  try {
    const settings = req.body;
    await run(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ('general_settings', ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(settings)]
    );
    res.json({ message: 'Configurações gerais atualizadas com sucesso.', settings });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar configurações gerais.' });
  }
});

const DEFAULT_SECTIONS_ORDER = [
  { id: 'hero', name: 'Hero Section (Apresentação, Logotipo & Vídeo)', description: 'Primeira dobra com logotipo centralizado, vídeo/slideshow em tela cheia e botões de ação.', is_active: true },
  { id: 'parceiros', name: 'Seguradoras Parceiras (Letreiro Contínuo)', description: 'Logos oficiais das principais seguradoras parceiras em letreiro infinito com pausa ao passar o mouse.', is_active: true },
  { id: 'sobre', name: 'Sobre a G11 Conceito Financeiro', description: 'História institucional, pilares estratégicos, missão, visão e valores fundamentais.', is_active: true },
  { id: 'produtos', name: 'Soluções & Produtos Estratégicos', description: 'Grade de produtos (Vida, Saúde, Previdência, Consórcios) e benefícios exclusivos.', is_active: true },
  { id: 'galeria', name: 'Galerias de Viagens & Eventos', description: 'Pastas e álbuns fotográficos das convenções e experiências internacionais.', is_active: true },
  { id: 'instagram', name: 'Feed & Incorporações do Instagram', description: 'Publicações oficiais e vídeos incorporados diretamente do Instagram.', is_active: true },
  { id: 'depoimentos', name: 'Depoimentos de Parceiros & Corretores', description: 'Avaliações e histórias reais de corretores e clientes estratégicos.', is_active: true },
  { id: 'sinistros', name: 'Central de Atendimento a Sinistros & FAQ', description: 'Orientações práticas passo a passo e perguntas frequentes para suporte.', is_active: true },
  { id: 'contato', name: 'Localização, Mapa Google & Contato', description: 'Endereço corporativo, horários de atendimento, mapa interativo e WhatsApp.', is_active: true }
];

// GET sections order
router.get('/sections-order', async (req, res) => {
  try {
    const row = await get('SELECT value FROM site_settings WHERE key = ?', ['sections_order']);
    if (row && row.value) {
      return res.json(JSON.parse(row.value));
    }
    res.json(DEFAULT_SECTIONS_ORDER);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter ordem das seções.' });
  }
});

// PUT update sections order
router.put('/sections-order', async (req, res) => {
  try {
    let sectionsOrder = req.body;
    if (sectionsOrder && Array.isArray(sectionsOrder.sections)) {
      sectionsOrder = sectionsOrder.sections;
    }
    if (!Array.isArray(sectionsOrder)) {
      return res.status(400).json({ error: 'A ordem das seções deve ser uma lista.' });
    }
    await run(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ('sections_order', ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(sectionsOrder)]
    );
    res.json({ message: 'Ordem das seções salva com sucesso.', sections: sectionsOrder });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar ordem das seções.' });
  }
});

module.exports = router;
