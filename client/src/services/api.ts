import {
  SiteDataResponse,
  User,
  HeroConfig,
  HeroSlide,
  Album,
  Product,
  ExclusiveBenefit,
  Testimonial,
  ClaimFaq,
  InstagramPost,
  GeneralSettings,
  AboutContent,
  SectionItem
} from '../types';
import { initialSiteData } from '../data/initialSiteData';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('g11_admin_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('g11_admin_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('g11_admin_token');
}

// Local storage state helpers for standalone/Vercel mode
function getLocalSiteData(): SiteDataResponse {
  try {
    const raw = localStorage.getItem('g11_local_sitedata');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hero && parsed.hero.config) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local site data', e);
  }
  return JSON.parse(JSON.stringify(initialSiteData));
}

function saveLocalSiteData(data: SiteDataResponse) {
  try {
    localStorage.setItem('g11_local_sitedata', JSON.stringify(data));
  } catch (e) {
    console.error('Error saving local site data', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (res.status === 401 && !endpoint.includes('/auth/login')) {
    removeAuthToken();
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('API offline ou resposta não é JSON válido.');
  }

  const data = await res.json().catch(() => null);
  if (!data || !res.ok) {
    throw new Error(data?.error || `Erro ${res.status}: Não foi possível concluir a operação.`);
  }

  return data;
}

// Public API
export async function fetchPublicSiteData(): Promise<SiteDataResponse> {
  try {
    const local = localStorage.getItem('g11_local_sitedata');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && parsed.hero && parsed.hero.config) {
          return parsed;
        }
      } catch (_) {}
    }
    const data = await request<SiteDataResponse>('/public/site-data');
    if (data && data.hero && data.hero.config) {
      return data;
    }
    return getLocalSiteData();
  } catch (err) {
    // Standalone / Vercel fallback without database
    return getLocalSiteData();
  }
}

// Auth API
export async function login(credentials: { username: string; password: string }): Promise<{ token: string; user: User }> {
  try {
    const data = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    setAuthToken(data.token);
    return data;
  } catch (err: any) {
    // Offline authentication fallback for Vercel
    if (credentials.username === 'admin' && credentials.password === 'g11admin2026') {
      const staticToken = 'g11_static_token';
      const staticUser: User = { id: 1, username: 'admin', email: 'admin@g11.com.br', role: 'admin' };
      setAuthToken(staticToken);
      return { token: staticToken, user: staticUser };
    }
    throw err;
  }
}

export async function fetchCurrentUser(): Promise<{ user: User }> {
  try {
    return await request<{ user: User }>('/auth/me');
  } catch (err) {
    return { user: { id: 1, username: 'admin', email: 'admin@g11.com.br', role: 'admin' } };
  }
}

// Hero Admin API
export async function updateHeroConfig(config: Partial<HeroConfig>): Promise<{ config: HeroConfig }> {
  try {
    return await request('/admin/hero/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  } catch (err) {
    const data = getLocalSiteData();
    data.hero.config = { ...data.hero.config, ...config };
    saveLocalSiteData(data);
    return { config: data.hero.config as HeroConfig };
  }
}

export async function addHeroSlide(slide: Partial<HeroSlide>): Promise<{ slide: HeroSlide }> {
  try {
    return await request('/admin/hero/slides', {
      method: 'POST',
      body: JSON.stringify(slide)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const newSlide: HeroSlide = {
      id: Date.now(),
      image_desktop: slide.image_desktop || '',
      image_mobile: slide.image_mobile || slide.image_desktop || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      order_index: data.hero.slides.length,
      is_active: slide.is_active ?? 1
    };
    data.hero.slides.push(newSlide);
    saveLocalSiteData(data);
    return { slide: newSlide };
  }
}

export async function updateHeroSlide(id: number, slide: Partial<HeroSlide>): Promise<{ slide: HeroSlide }> {
  try {
    return await request(`/admin/hero/slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(slide)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const index = data.hero.slides.findIndex(s => s.id === id);
    if (index !== -1) {
      data.hero.slides[index] = { ...data.hero.slides[index], ...slide };
      saveLocalSiteData(data);
      return { slide: data.hero.slides[index] };
    }
    throw new Error('Slide não encontrado');
  }
}

export async function deleteHeroSlide(id: number): Promise<void> {
  try {
    await request(`/admin/hero/slides/${id}`, { method: 'DELETE' });
  } catch (err) {
    const data = getLocalSiteData();
    data.hero.slides = data.hero.slides.filter(s => s.id !== id);
    saveLocalSiteData(data);
  }
}

export async function reorderHeroSlides(slideIds: number[]): Promise<void> {
  try {
    await request('/admin/hero/slides-reorder', {
      method: 'PUT',
      body: JSON.stringify({ slideIds })
    });
  } catch (err) {
    const data = getLocalSiteData();
    data.hero.slides.sort((a, b) => slideIds.indexOf(a.id) - slideIds.indexOf(b.id));
    saveLocalSiteData(data);
  }
}

// Albums & Photos Admin API
export async function fetchAdminAlbums(): Promise<Album[]> {
  try {
    return await request<Album[]>('/admin/albums');
  } catch (err) {
    return getLocalSiteData().albums;
  }
}

export async function createAlbum(album: Partial<Album>): Promise<{ album: Album }> {
  try {
    return await request('/admin/albums', {
      method: 'POST',
      body: JSON.stringify(album)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const newAlbum: Album = {
      id: Date.now(),
      slug: album.slug || `album-${Date.now()}`,
      title: album.title || '',
      destination: album.destination || '',
      category: album.category || '',
      year: album.year || String(new Date().getFullYear()),
      cover_image: album.cover_image || '',
      description: album.description || '',
      order_index: data.albums.length,
      is_active: album.is_active ?? 1,
      photo_count: 0,
      photos: []
    };
    data.albums.push(newAlbum);
    saveLocalSiteData(data);
    return { album: newAlbum };
  }
}

export async function updateAlbum(id: number, album: Partial<Album>): Promise<{ album: Album }> {
  try {
    return await request(`/admin/albums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(album)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const index = data.albums.findIndex(a => a.id === id);
    if (index !== -1) {
      data.albums[index] = { ...data.albums[index], ...album };
      saveLocalSiteData(data);
      return { album: data.albums[index] };
    }
    throw new Error('Álbum não encontrado');
  }
}

export async function deleteAlbum(id: number): Promise<void> {
  try {
    await request(`/admin/albums/${id}`, { method: 'DELETE' });
  } catch (err) {
    const data = getLocalSiteData();
    data.albums = data.albums.filter(a => a.id !== id);
    saveLocalSiteData(data);
  }
}

export async function addPhotoToAlbum(albumId: number, photo: { url: string; title?: string; alt_text?: string; caption?: string }): Promise<void> {
  try {
    await request(`/admin/albums/${albumId}/photos`, {
      method: 'POST',
      body: JSON.stringify(photo)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const album = data.albums.find(a => a.id === albumId);
    if (album) {
      if (!album.photos) album.photos = [];
      album.photos.push({
        id: Date.now(),
        album_id: albumId,
        url: photo.url,
        title: photo.title || '',
        alt_text: photo.alt_text || '',
        caption: photo.caption || '',
        order_index: album.photos.length,
        is_active: 1
      });
      album.photo_count = album.photos.length;
      saveLocalSiteData(data);
    }
  }
}

export async function deletePhoto(photoId: number): Promise<void> {
  try {
    await request(`/admin/albums/photos/${photoId}`, { method: 'DELETE' });
  } catch (err) {
    const data = getLocalSiteData();
    for (const alb of data.albums) {
      if (alb.photos) {
        alb.photos = alb.photos.filter(p => p.id !== photoId);
        alb.photo_count = alb.photos.length;
      }
    }
    saveLocalSiteData(data);
  }
}

export async function updatePhoto(photoId: number, photoData: { title?: string; alt_text?: string; caption?: string; is_active?: boolean }): Promise<void> {
  try {
    await request(`/admin/albums/photos/${photoId}`, {
      method: 'PUT',
      body: JSON.stringify(photoData)
    });
  } catch (err) {
    const data = getLocalSiteData();
    for (const alb of data.albums) {
      if (alb.photos) {
        const p = alb.photos.find(item => item.id === photoId);
        if (p) {
          Object.assign(p, photoData);
        }
      }
    }
    saveLocalSiteData(data);
  }
}

export async function reorderPhotos(albumId: number, photoIds: number[]): Promise<void> {
  try {
    await request(`/admin/albums/${albumId}/photos-reorder`, {
      method: 'PUT',
      body: JSON.stringify({ photoIds })
    });
  } catch (err) {
    const data = getLocalSiteData();
    const alb = data.albums.find(a => a.id === albumId);
    if (alb && alb.photos) {
      alb.photos.sort((a, b) => photoIds.indexOf(a.id) - photoIds.indexOf(b.id));
      saveLocalSiteData(data);
    }
  }
}

// Instagram Admin API
export async function fetchAdminInstagram(): Promise<InstagramPost[]> {
  try {
    return await request<InstagramPost[]>('/admin/instagram');
  } catch (err) {
    return getLocalSiteData().instagram;
  }
}

export async function addInstagramPost(post: Partial<InstagramPost>): Promise<{ post: InstagramPost }> {
  try {
    return await request('/admin/instagram', {
      method: 'POST',
      body: JSON.stringify(post)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const newPost: InstagramPost = {
      id: Date.now(),
      post_url: post.post_url || '',
      title: post.title || '',
      category: post.category || 'G11 Institucional',
      embed_html: post.embed_html,
      image_url: post.image_url,
      order_index: data.instagram.length,
      is_active: post.is_active ?? 1
    };
    data.instagram.push(newPost);
    saveLocalSiteData(data);
    return { post: newPost };
  }
}

export async function updateInstagramPost(id: number, post: Partial<InstagramPost>): Promise<{ post: InstagramPost }> {
  try {
    return await request(`/admin/instagram/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const idx = data.instagram.findIndex(p => p.id === id);
    if (idx !== -1) {
      data.instagram[idx] = { ...data.instagram[idx], ...post };
      saveLocalSiteData(data);
      return { post: data.instagram[idx] };
    }
    throw new Error('Post não encontrado');
  }
}

export async function deleteInstagramPost(id: number): Promise<void> {
  try {
    await request(`/admin/instagram/${id}`, { method: 'DELETE' });
  } catch (err) {
    const data = getLocalSiteData();
    data.instagram = data.instagram.filter(p => p.id !== id);
    saveLocalSiteData(data);
  }
}

// Content Sections Admin API
export async function updateAboutContent(about: Partial<AboutContent>): Promise<void> {
  try {
    await request('/admin/content/about', {
      method: 'PUT',
      body: JSON.stringify(about)
    });
  } catch (err) {
    const data = getLocalSiteData();
    data.about = { ...data.about, ...about };
    saveLocalSiteData(data);
  }
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<void> {
  try {
    await request(`/admin/content/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const idx = data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      data.products[idx] = { ...data.products[idx], ...product };
      saveLocalSiteData(data);
    }
  }
}

export async function addProduct(product: Partial<Product>): Promise<void> {
  try {
    await request('/admin/content/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const newProd: Product = {
      id: Date.now(),
      slug: product.slug || `produto-${Date.now()}`,
      title: product.title || '',
      tag: product.tag || 'Seguros',
      description: product.description || '',
      card_image: product.card_image || '',
      features: product.features || [],
      order_index: data.products.length,
      is_active: product.is_active ?? 1
    };
    data.products.push(newProd);
    saveLocalSiteData(data);
  }
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await request(`/admin/content/products/${id}`, { method: 'DELETE' });
  } catch (err) {
    const data = getLocalSiteData();
    data.products = data.products.filter(p => p.id !== id);
    saveLocalSiteData(data);
  }
}

export async function updateBenefit(id: number, benefit: Partial<ExclusiveBenefit>): Promise<void> {
  try {
    await request(`/admin/content/benefits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(benefit)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const idx = data.benefits.findIndex(b => b.id === id);
    if (idx !== -1) {
      data.benefits[idx] = { ...data.benefits[idx], ...benefit };
      saveLocalSiteData(data);
    }
  }
}

export async function addBenefit(benefit: Partial<ExclusiveBenefit>): Promise<void> {
  try {
    await request('/admin/content/benefits', {
      method: 'POST',
      body: JSON.stringify(benefit)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const newBen: ExclusiveBenefit = {
      id: Date.now(),
      title: benefit.title || '',
      description: benefit.description || '',
      icon: benefit.icon || 'Star',
      order_index: data.benefits.length,
      is_active: benefit.is_active ?? 1
    };
    data.benefits.push(newBen);
    saveLocalSiteData(data);
  }
}

export async function deleteBenefit(id: number): Promise<void> {
  try {
    await request(`/admin/content/benefits/${id}`, { method: 'DELETE' });
  } catch (err) {
    const data = getLocalSiteData();
    data.benefits = data.benefits.filter(b => b.id !== id);
    saveLocalSiteData(data);
  }
}

export async function updateTestimonial(id: number, testimonial: Partial<Testimonial>): Promise<void> {
  try {
    await request(`/admin/content/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testimonial)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const idx = data.testimonials.findIndex(t => t.id === id);
    if (idx !== -1) {
      data.testimonials[idx] = { ...data.testimonials[idx], ...testimonial };
      saveLocalSiteData(data);
    }
  }
}

export async function addTestimonial(testimonial: Partial<Testimonial>): Promise<void> {
  try {
    await request('/admin/content/testimonials', {
      method: 'POST',
      body: JSON.stringify(testimonial)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const newTest: Testimonial = {
      id: Date.now(),
      name: testimonial.name || '',
      role: testimonial.role || '',
      quote: testimonial.quote || '',
      stars: testimonial.stars || 5,
      avatar: testimonial.avatar,
      order_index: data.testimonials.length,
      is_active: testimonial.is_active ?? 1
    };
    data.testimonials.push(newTest);
    saveLocalSiteData(data);
  }
}

export async function deleteTestimonial(id: number): Promise<void> {
  try {
    await request(`/admin/content/testimonials/${id}`, { method: 'DELETE' });
  } catch (err) {
    const data = getLocalSiteData();
    data.testimonials = data.testimonials.filter(t => t.id !== id);
    saveLocalSiteData(data);
  }
}

export async function updateClaim(id: number, claim: Partial<ClaimFaq>): Promise<void> {
  try {
    await request(`/admin/content/claims/${id}`, {
      method: 'PUT',
      body: JSON.stringify(claim)
    });
  } catch (err) {
    const data = getLocalSiteData();
    const idx = data.claims.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.claims[idx] = { ...data.claims[idx], ...claim };
      saveLocalSiteData(data);
    }
  }
}

// Settings Admin API
export async function updateGeneralSettings(settings: Partial<GeneralSettings>): Promise<void> {
  try {
    await request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  } catch (err) {
    const data = getLocalSiteData();
    data.settings = { ...data.settings, ...settings };
    saveLocalSiteData(data);
  }
}

export async function fetchSectionsOrder(): Promise<SectionItem[]> {
  try {
    return await request<SectionItem[]>('/admin/settings/sections-order');
  } catch (err) {
    return getLocalSiteData().sections_order || [];
  }
}

export async function updateSectionsOrder(sections: SectionItem[]): Promise<{ sections: SectionItem[] }> {
  try {
    return await request('/admin/settings/sections-order', {
      method: 'PUT',
      body: JSON.stringify(sections)
    });
  } catch (err) {
    const data = getLocalSiteData();
    data.sections_order = sections;
    saveLocalSiteData(data);
    return { sections };
  }
}

// Media Upload API
export async function uploadMediaFile(file: File, folder = 'geral'): Promise<{ url: string; filename: string }> {
  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/admin/media/upload?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Erro no envio do arquivo.');
    }

    return data;
  } catch (err) {
    // Local / static fallback: convert to base64 Data URL so preview works even without server
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          filename: file.name
        });
      };
      reader.onerror = () => reject(err);
      reader.readAsDataURL(file);
    });
  }
}

export async function fetchMediaLibrary(): Promise<Array<{ url: string; filename: string; relPath: string; size: number; updatedAt: string }>> {
  try {
    return await request('/admin/media');
  } catch (err) {
    const data = getLocalSiteData();
    const list: Array<{ url: string; filename: string; relPath: string; size: number; updatedAt: string }> = [];
    data.hero.slides.forEach(s => {
      if (s.image_desktop) {
        list.push({
          url: s.image_desktop,
          filename: s.image_desktop.split('/').pop() || '',
          relPath: s.image_desktop,
          size: 1024,
          updatedAt: new Date().toISOString()
        });
      }
    });
    data.albums.forEach(a => {
      if (a.cover_image) {
        list.push({
          url: a.cover_image,
          filename: a.cover_image.split('/').pop() || '',
          relPath: a.cover_image,
          size: 1024,
          updatedAt: new Date().toISOString()
        });
      }
      a.photos?.forEach(p => {
        if (p.url) {
          list.push({
            url: p.url,
            filename: p.url.split('/').pop() || '',
            relPath: p.url,
            size: 1024,
            updatedAt: new Date().toISOString()
          });
        }
      });
    });
    return list;
  }
}

// Dashboard Stats API
export async function fetchDashboardStats(): Promise<{
  albumsCount: number;
  photosCount: number;
  heroSlidesCount: number;
  productsCount: number;
  testimonialsCount: number;
  instagramCount: number;
  databaseType: string;
  status: string;
}> {
  try {
    return await request('/admin/stats');
  } catch (err) {
    const data = getLocalSiteData();
    const totalPhotos = data.albums.reduce((acc, a) => acc + (a.photos?.length || 0), 0);
    return {
      albumsCount: data.albums.length,
      photosCount: totalPhotos,
      heroSlidesCount: data.hero.slides.length,
      productsCount: data.products.length,
      testimonialsCount: data.testimonials.length,
      instagramCount: data.instagram.length,
      databaseType: 'Estático (Vercel / Código-Fonte)',
      status: 'Online (Fixado no código-fonte)'
    };
  }
}
