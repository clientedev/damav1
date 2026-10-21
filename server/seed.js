const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { run, get, all, initSchema } = require('./db');

async function seedDatabase() {
  await initSchema();

  // 1. Create or verify initial Admin User
  const existingAdmin = await get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'g11admin2026';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    await run(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['admin', 'contato@g11conceitofinanceiro.com.br', passwordHash, 'admin']
    );
    console.log(`[SEED] Admin user created: username="admin", password="${defaultPassword}"`);
  } else {
    console.log('[SEED] Admin user already exists.');
  }

  // Load site_data_final.json
  const dataPath = path.join(__dirname, '..', 'site_data_final.json');
  if (!fs.existsSync(dataPath)) {
    console.warn('[SEED] site_data_final.json not found, skipping content seed.');
    return;
  }

  const siteData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // 2. Seed Site Settings (Hero, Contact, Branding, SEO, About)
  const existingHeroSetting = await get('SELECT * FROM site_settings WHERE key = ?', ['hero_config']);
  if (!existingHeroSetting) {
    const heroConfig = {
      slideshow_enabled: true,
      transition_duration: 6000,
      transition_effect: 'fade', // 'fade' | 'zoom' | 'slide'
      overlay_darkness: 65, // % opacity
      logo_url: '/uploads/branding/logo_hero_central.png',
      logo_size_desktop: 420, // px width
      logo_size_mobile: 280, // px width
      tagline: 'G11 Conceito Financeiro',
      subtitle: 'Assessoria Especializada e Soluções Estratégicas para Corretores de Alta Performance',
      cta_primary_text: 'Fale com um Especialista',
      cta_primary_link: 'https://wa.me/5511991606951?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es!',
      cta_secondary_text: 'Conheça Nossas Soluções',
      cta_secondary_link: '#solucoes'
    };
    await run('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['hero_config', JSON.stringify(heroConfig)]);
    console.log('[SEED] Hero config seeded.');
  }

  // General site settings
  const existingGeneralSetting = await get('SELECT * FROM site_settings WHERE key = ?', ['general_settings']);
  if (!existingGeneralSetting) {
    const generalSettings = {
      company_name: siteData.site_info.title,
      founded_date: siteData.site_info.founded_date,
      description: siteData.site_info.description,
      address_full: siteData.site_info.address.full_formatted,
      address_street: siteData.site_info.address.street,
      address_neighborhood: siteData.site_info.address.neighborhood,
      address_city: siteData.site_info.address.city,
      address_state: siteData.site_info.address.state,
      address_cep: siteData.site_info.address.cep,
      google_maps_url: siteData.site_info.address.google_maps_url,
      whatsapp: siteData.site_info.contact.whatsapp,
      whatsapp_url: siteData.site_info.contact.whatsapp_url,
      instagram_url: siteData.site_info.contact.instagram,
      business_hours: siteData.site_info.contact.business_hours,
      logo_principal: '/uploads/branding/logo_principal.png',
      logo_nav_footer: '/uploads/branding/logo_nav_footer.png',
      logo_badge: '/uploads/branding/logo_badge_lg.png',
      parceiros_grid: '/uploads/branding/parceiros_g11_grid.png',
      parceiro_omint: '/uploads/branding/parceiro_omint.png',
      meta_title: 'G11 Conceito Financeiro | Assessoria de Alta Performance',
      meta_description: 'Assessoria especializada que conecta corretores de alta performance às principais instituições financeiras, previdência, saúde e seguros.',
      meta_keywords: 'seguros, corretor de seguros, previdência privada, plano de saúde, consultoria financeira, g11 conceito financeiro'
    };
    await run('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['general_settings', JSON.stringify(generalSettings)]);
    console.log('[SEED] General settings seeded.');
  }

  // About & Institutional content
  const existingAboutSetting = await get('SELECT * FROM site_settings WHERE key = ?', ['about_content']);
  if (!existingAboutSetting) {
    const aboutContent = {
      title: siteData.institucional.conheca_g11.title,
      text_conheca: siteData.institucional.conheca_g11.text,
      image_equipe: '/uploads/institucional/conheca_g11_equipe.jpg',
      banner_sobre: '/uploads/institucional/sobre_empresa_banner.jpg',
      arte_sobre: '/uploads/institucional/sobre_g11_arte.png',
      missao: siteData.institucional.sobre_detalhado.missao,
      visao: siteData.institucional.sobre_detalhado.visao,
      valores: siteData.institucional.sobre_detalhado.valores
    };
    await run('INSERT INTO site_settings (key, value) VALUES (?, ?)', ['about_content', JSON.stringify(aboutContent)]);
    console.log('[SEED] About content seeded.');
  }

  // 3. Seed Hero Slides (using high-res event covers and institutional banners)
  const existingSlides = await all('SELECT * FROM hero_slides');
  if (existingSlides.length === 0) {
    const slidesData = [
      {
        image_desktop: '/uploads/capas_eventos/capa_1_italia_capri.png',
        image_mobile: '/uploads/capas_eventos/capa_1_italia_capri.png',
        title: 'Convenção Internacional Capri / Itália',
        subtitle: 'Experiências exclusivas e celebração de resultados',
        order_index: 0
      },
      {
        image_desktop: '/uploads/capas_eventos/capa_5_japao.png',
        image_mobile: '/uploads/capas_eventos/capa_5_japao.png',
        title: 'Expedição Japão',
        subtitle: 'Conexões globais e alta performance profissional',
        order_index: 1
      },
      {
        image_desktop: '/uploads/capas_eventos/capa_2_africa.png',
        image_mobile: '/uploads/capas_eventos/capa_2_africa.png',
        title: 'Safári África do Sul',
        subtitle: 'Momentos inesquecíveis para os maiores líderes do mercado',
        order_index: 2
      },
      {
        image_desktop: '/uploads/capas_eventos/capa_4_grecia.png',
        image_mobile: '/uploads/capas_eventos/capa_4_grecia.png',
        title: 'Grécia Exclusiva',
        subtitle: 'Reconhecimento para quem atinge o topo',
        order_index: 3
      },
      {
        image_desktop: '/uploads/capas_eventos/capa_3_paris.png',
        image_mobile: '/uploads/capas_eventos/capa_3_paris.png',
        title: 'Paris / França',
        subtitle: 'Excelência e sofisticação em cada detalhe',
        order_index: 4
      }
    ];

    for (const s of slidesData) {
      await run(
        'INSERT INTO hero_slides (image_desktop, image_mobile, title, subtitle, order_index, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [s.image_desktop, s.image_mobile, s.title, s.subtitle, s.order_index]
      );
    }
    console.log(`[SEED] ${slidesData.length} Hero slides seeded.`);
  }

  // 4. Seed Albums and Photos (from real extracted albums)
  const existingAlbums = await all('SELECT * FROM albums');
  if (existingAlbums.length === 0 && siteData.galeria_realizacoes) {
    const albums = siteData.galeria_realizacoes.albuns_completos || [];
    const covers = siteData.galeria_realizacoes.capas_grid || [];

    for (let i = 0; i < albums.length; i++) {
      const alb = albums[i];
      const matchingCover = covers.find((c) => c.album_info?.folder_name === alb.folder_name);
      const coverUrl = matchingCover?.cover_filename
        ? `/uploads/capas_eventos/${matchingCover.cover_filename}`
        : `/uploads/eventos_e_viagens/${alb.folder_name}/${alb.photos?.[0]?.filename || 'foto_01.jpeg'}`;

      const res = await run(
        `INSERT INTO albums (slug, title, destination, category, year, cover_image, description, order_index, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          alb.folder_name,
          alb.title,
          alb.destination || 'Internacional',
          alb.destination === 'Awards' || alb.destination === 'Novotel' ? 'Eventos & Premiações' : 'Viagens Internacionais',
          '2024-2025',
          coverUrl,
          `Galeria oficial de fotos da experiência ${alb.title} pela G11 Conceito Financeiro.`,
          i
        ]
      );

      const albumId = res.lastID;

      // Insert photos for this album
      const photos = alb.photos || [];
      for (let pIdx = 0; pIdx < photos.length; pIdx++) {
        const p = photos[pIdx];
        const photoUrl = `/uploads/eventos_e_viagens/${alb.folder_name}/${p.filename}`;
        await run(
          `INSERT INTO photos (album_id, url, title, alt_text, caption, width, height, order_index, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            albumId,
            photoUrl,
            `${alb.title} - Foto #${pIdx + 1}`,
            `Fotografia ${pIdx + 1} de ${alb.title} - G11 Conceito Financeiro`,
            `Momento exclusivo registrado em ${alb.destination}`,
            p.width || 1200,
            p.height || 800,
            pIdx
          ]
        );
      }
      console.log(`[SEED] Album "${alb.title}" seeded with ${photos.length} photos.`);
    }

    // Also add Cover 8 as an Exclusive Experiences album if not present
    const cover8 = covers.find((c) => c.cover_filename?.includes('evento_8'));
    if (cover8) {
      await run(
        `INSERT INTO albums (slug, title, destination, category, year, cover_image, description, order_index, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          'experiencias-exclusivas',
          'Experiências & Reconhecimento',
          'Brasil & Mundo',
          'Eventos & Premiações',
          '2025',
          `/uploads/capas_eventos/${cover8.cover_filename}`,
          'Momentos únicos e experiências exclusivas promovidas pela G11 Conceito Financeiro para parceiros e corretores de elite.',
          albums.length
        ]
      );
      console.log('[SEED] Album "Experiências & Reconhecimento" seeded.');
    }
  }

  // 5. Seed Products
  const existingProducts = await all('SELECT * FROM products');
  if (existingProducts.length === 0 && siteData.produtos) {
    for (let i = 0; i < siteData.produtos.length; i++) {
      const prod = siteData.produtos[i];
      const cardImageUrl = prod.card_image ? `/${prod.card_image.replace(/\\/g, '/')}` : '';
      await run(
        `INSERT INTO products (slug, title, tag, description, card_image, features_json, order_index, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          prod.id,
          prod.nome,
          prod.tag,
          prod.descricao,
          cardImageUrl,
          JSON.stringify([
            'Cobertura personalizada',
            'Assessoria e suporte integral',
            'Agilidade no atendimento e sinistros'
          ]),
          i
        ]
      );
    }
    console.log(`[SEED] ${siteData.produtos.length} Products seeded.`);
  }

  // 6. Seed Exclusive Benefits
  const existingBenefits = await all('SELECT * FROM exclusive_benefits');
  if (existingBenefits.length === 0 && siteData.beneficios_exclusivos?.itens) {
    const icons = ['Clock', 'Home', 'Smile', 'HeartHandshake', 'Sparkles'];
    for (let i = 0; i < siteData.beneficios_exclusivos.itens.length; i++) {
      const ben = siteData.beneficios_exclusivos.itens[i];
      await run(
        `INSERT INTO exclusive_benefits (title, description, icon, order_index, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [ben.nome, ben.descricao, icons[i % icons.length], i]
      );
    }
    console.log(`[SEED] ${siteData.beneficios_exclusivos.itens.length} Exclusive benefits seeded.`);
  }

  // 7. Seed Testimonials
  const existingTestimonials = await all('SELECT * FROM testimonials');
  if (existingTestimonials.length === 0 && siteData.depoimentos) {
    for (let i = 0; i < siteData.depoimentos.length; i++) {
      const dep = siteData.depoimentos[i];
      await run(
        `INSERT INTO testimonials (name, role, quote, stars, order_index, is_active)
         VALUES (?, ?, ?, 5, ?, 1)`,
        [dep.nome, dep.cargo, dep.depoimento, i]
      );
    }
    console.log(`[SEED] ${siteData.depoimentos.length} Testimonials seeded.`);
  }

  // 8. Seed Claims FAQ
  const existingClaims = await all('SELECT * FROM claims_faq');
  if (existingClaims.length === 0 && siteData.sinistro) {
    const sin = siteData.sinistro;
    await run(
      `INSERT INTO claims_faq (question, answer, steps_json, order_index, is_active)
       VALUES (?, ?, ?, 0, 1)`,
      [
        sin.o_que_e.pergunta,
        sin.o_que_e.resposta,
        JSON.stringify([])
      ]
    );

    await run(
      `INSERT INTO claims_faq (question, answer, steps_json, order_index, is_active)
       VALUES (?, ?, ?, 1, 1)`,
      [
        sin.como_registrar.pergunta,
        'Siga as instruções abaixo para registrar seu sinistro com total tranquilidade:',
        JSON.stringify(sin.como_registrar.passos)
      ]
    );
    console.log('[SEED] Claims FAQ seeded.');
  }

  // 9. Seed Instagram Posts (Default official links for G11 Conceito Financeiro)
  const existingInsta = await all('SELECT * FROM instagram_posts');
  if (existingInsta.length === 0) {
    const defaultPosts = [
      {
        post_url: 'https://www.instagram.com/p/DFg11sample1/',
        title: 'Assessoria Especializada para Corretores de Alta Performance',
        category: 'Institucional',
        order_index: 0
      },
      {
        post_url: 'https://www.instagram.com/p/DFg11sample2/',
        title: 'Convenção Internacional e Reconhecimento G11',
        category: 'Viagens',
        order_index: 1
      },
      {
        post_url: 'https://www.instagram.com/p/DFg11sample3/',
        title: 'Proteção Patrimonial e Soluções Estratégicas',
        category: 'Soluções',
        order_index: 2
      }
    ];

    for (const post of defaultPosts) {
      await run(
        `INSERT INTO instagram_posts (post_url, title, category, order_index, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [post.post_url, post.title, post.category, post.order_index]
      );
    }
    console.log(`[SEED] ${defaultPosts.length} Instagram posts initialized.`);
  }

  console.log('--- DATABASE SEEDING COMPLETED SUCCESSFULLY ---');
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
