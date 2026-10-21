const fs = require('fs');
const path = require('path');
const { get, all } = require('./db');

async function exportData() {
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

  const heroSlidesFormatted = heroSlides.map((s) => ({
    id: s.id,
    image_desktop: s.image_desktop,
    image_mobile: s.image_mobile || undefined,
    title: s.title || undefined,
    subtitle: s.subtitle || undefined,
    order_index: s.order_index,
    is_active: s.is_active
  }));

  const albumsWithPhotos = await Promise.all(
    albums.map(async (alb) => {
      const photos = await all(
        'SELECT id, album_id, url, title, alt_text, caption, width, height, order_index, is_active FROM photos WHERE album_id = ? AND is_active = 1 ORDER BY order_index ASC',
        [alb.id]
      );
      const cleanPhotos = photos.map((p) => ({
        id: p.id,
        album_id: p.album_id,
        url: p.url,
        title: p.title || '',
        alt_text: p.alt_text || '',
        caption: p.caption || undefined,
        width: p.width || undefined,
        height: p.height || undefined,
        order_index: p.order_index,
        is_active: p.is_active
      }));
      return {
        id: alb.id,
        slug: alb.slug,
        title: alb.title,
        destination: alb.destination,
        category: alb.category,
        year: alb.year || undefined,
        cover_image: alb.cover_image,
        description: alb.description,
        order_index: alb.order_index,
        is_active: alb.is_active,
        photo_count: cleanPhotos.length,
        photos: cleanPhotos
      };
    })
  );

  const productsFormatted = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    tag: p.tag,
    description: p.description,
    card_image: p.card_image,
    features: p.features_json ? JSON.parse(p.features_json) : [],
    order_index: p.order_index,
    is_active: p.is_active
  }));

  const benefitsFormatted = benefits.map((b) => ({
    id: b.id,
    title: b.title,
    description: b.description,
    icon: b.icon,
    order_index: b.order_index,
    is_active: b.is_active
  }));

  const testimonialsFormatted = testimonials.map((t) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    quote: t.quote,
    stars: t.stars,
    avatar: t.avatar || undefined,
    order_index: t.order_index,
    is_active: t.is_active
  }));

  const claimsFormatted = claims.map((c) => ({
    id: c.id,
    question: c.question,
    answer: c.answer,
    steps: c.steps_json ? JSON.parse(c.steps_json) : [],
    order_index: c.order_index,
    is_active: c.is_active
  }));

  const instagramFormatted = instagram.map((i) => ({
    id: i.id,
    post_url: i.post_url,
    title: i.title,
    category: i.category,
    embed_html: i.embed_html || undefined,
    image_url: i.image_url || undefined,
    order_index: i.order_index,
    is_active: i.is_active
  }));

  const siteData = {
    hero: {
      config: heroConfigRow ? JSON.parse(heroConfigRow.value) : {},
      slides: heroSlidesFormatted
    },
    settings: generalSettingsRow ? JSON.parse(generalSettingsRow.value) : {},
    about: aboutContentRow ? JSON.parse(aboutContentRow.value) : {},
    albums: albumsWithPhotos,
    products: productsFormatted,
    benefits: benefitsFormatted,
    testimonials: testimonialsFormatted,
    claims: claimsFormatted,
    instagram: instagramFormatted,
    sections_order: sectionsOrderRow ? JSON.parse(sectionsOrderRow.value) : undefined
  };

  const tsContent = `import { SiteDataResponse } from '../types';

export const initialSiteData: SiteDataResponse = ${JSON.stringify(siteData, null, 2)};
export default initialSiteData;
`;

  const targetDir = path.join(__dirname, '..', 'client', 'src', 'data');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, 'initialSiteData.ts');
  fs.writeFileSync(targetFile, tsContent, 'utf-8');
  console.log(`Successfully exported initial site data to ${targetFile}`);

  // Also write client/public/site-data.json
  const publicJsonFile = path.join(__dirname, '..', 'client', 'public', 'site-data.json');
  fs.writeFileSync(publicJsonFile, JSON.stringify(siteData, null, 2), 'utf-8');
  console.log(`Successfully exported public site-data.json to ${publicJsonFile}`);
}

exportData().catch(console.error);
