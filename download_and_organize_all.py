import os
import sys
import json
import time
import requests
from urllib.parse import urlparse

sys.stdout.reconfigure(encoding='utf-8')

# Load routes_summary.json
with open('routes_summary.json', encoding='utf-8') as f:
    routes = json.load(f)

# Load home gallery
with open('script_wix-warmup-data.json', encoding='utf-8') as f:
    warmup = json.load(f)

home_gallery_items = warmup['appsWarmupData']['14271d6f-ba62-d045-549b-ab972ae1f70e']['comp-lkjsznem_galleryData']['items']

# Map pageId to album metadata
album_meta_map = {
    'bo9ex': {
        'folder_name': 'italia_capri',
        'title': 'Capri / Itália',
        'destination': 'Itália',
        'route': '/projetos-1'
    },
    'fbpr1': {
        'folder_name': 'africa',
        'title': 'África do Sul',
        'destination': 'África',
        'route': '/projetos-1-1-1-1-1'
    },
    'n1lk3': {
        'folder_name': 'paris',
        'title': 'Paris / França',
        'destination': 'França',
        'route': '/projetos-1-1-1'
    },
    'xk38q': {
        'folder_name': 'grecia',
        'title': 'Grécia',
        'destination': 'Grécia',
        'route': '/projetos-1-1-1-2'
    },
    'fv7dp': {
        'folder_name': 'japao',
        'title': 'Japão',
        'destination': 'Japão',
        'route': '/projetos-1-1-1-2-1'
    },
    'd6byu': {
        'folder_name': 'awards',
        'title': 'Awards & Premiações',
        'destination': 'Awards',
        'route': '/projetos-1-1-1-1'
    },
    'htq3m': {
        'folder_name': 'novotel',
        'title': 'Convenção Novotel',
        'destination': 'Novotel',
        'route': '/projetos-1-1'
    }
}

# Base download function
def download_image(media_id_or_url, dest_folder, custom_filename=None):
    os.makedirs(dest_folder, exist_ok=True)
    if media_id_or_url.startswith('http'):
        url = media_id_or_url
    else:
        url = f"https://static.wixstatic.com/media/{media_id_or_url}"
        
    filename = custom_filename or media_id_or_url.split('/')[-1]
    # sanitize filename
    filename = "".join(c for c in filename if c.isalnum() or c in ('_', '-', '.'))
    dest_path = os.path.join(dest_folder, filename)
    
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return dest_path
        
    try:
        r = requests.get(url, timeout=20)
        if r.status_code == 200 and len(r.content) > 100:
            with open(dest_path, 'wb') as img_f:
                img_f.write(r.content)
            print(f"  [OK] Downloaded {filename} ({len(r.content)} bytes)")
            return dest_path
        else:
            print(f"  [FAIL] HTTP {r.status_code} for {url}")
            return None
    except Exception as e:
        print(f"  [ERROR] {e} for {url}")
        return None

print("=== STEP 1: DOWNLOADING COVER IMAGES (CAPAS DE EVENTOS/VIAGENS) ===")
capas_dir = os.path.join('assets', 'images', 'capas_eventos')
os.makedirs(capas_dir, exist_ok=True)

covers_data = []
for i, item in enumerate(home_gallery_items):
    media_url = item.get('mediaUrl')
    meta = item.get('metaData', {})
    link_data = meta.get('link', {}).get('data', {})
    target_page_id = (link_data.get('pageId') or '').lstrip('#')
    
    album_info = album_meta_map.get(target_page_id, {
        'folder_name': f'evento_{i+1}',
        'title': f'Evento / Viagem {i+1}',
        'destination': 'Evento',
        'route': None
    })
    
    cover_filename = f"capa_{i+1}_{album_info['folder_name']}.png"
    downloaded_path = download_image(media_url, capas_dir, cover_filename)
    
    covers_data.append({
        'index': i + 1,
        'item_id': item.get('itemId'),
        'media_url': media_url,
        'cover_filename': cover_filename,
        'local_path': downloaded_path.replace('\\', '/') if downloaded_path else None,
        'target_page_id': target_page_id,
        'album_info': album_info
    })

print(f"Successfully processed {len(covers_data)} cover images.")

print("\n=== STEP 2: DOWNLOADING ALBUM FOLDER GALLERIES ===")
albums_final = []

for r in routes:
    page_id = r.get('page_id')
    if page_id in album_meta_map:
        info = album_meta_map[page_id]
        folder_dir = os.path.join('assets', 'images', 'eventos_e_viagens', info['folder_name'])
        os.makedirs(folder_dir, exist_ok=True)
        
        album_photos = []
        if r.get('galleries'):
            g_items = r['galleries'][0]['all_items']
            print(f"\nDownloading album '{info['title']}' ({len(g_items)} photos)...")
            for p_idx, p_item in enumerate(g_items):
                p_media_url = p_item.get('mediaUrl')
                p_meta = p_item.get('metaData', {})
                ext = p_media_url.split('.')[-1] if '.' in p_media_url else 'jpg'
                if len(ext) > 4:
                    ext = 'jpg'
                p_filename = f"foto_{p_idx+1:02d}.{ext}"
                p_path = download_image(p_media_url, folder_dir, p_filename)
                
                album_photos.append({
                    'index': p_idx + 1,
                    'media_url': p_media_url,
                    'filename': p_filename,
                    'local_path': p_path.replace('\\', '/') if p_path else None,
                    'width': p_meta.get('width'),
                    'height': p_meta.get('height'),
                    'original_fileName': p_meta.get('fileName')
                })
        
        # Find matching cover
        matching_cover = next((c for c in covers_data if c['target_page_id'] == page_id), None)
        
        albums_final.append({
            'page_id': page_id,
            'folder_name': info['folder_name'],
            'title': info['title'],
            'destination': info['destination'],
            'route': info['route'],
            'page_title': r.get('title'),
            'cover': matching_cover,
            'photo_count': len(album_photos),
            'photos': album_photos
        })

print(f"\nSuccessfully downloaded {len(albums_final)} event/travel albums.")

print("\n=== STEP 3: DOWNLOADING LOGO & INSTITUTIONAL ASSETS ===")
inst_dir = os.path.join('assets', 'images', 'institucional')
os.makedirs(inst_dir, exist_ok=True)

# Main logo from Wix
logo_url = "https://static.wixstatic.com/media/41c832_06ee31991b604295bec930409ca16bfa~mv2.png"
logo_path = download_image(logo_url, inst_dir, "logo_g11.png")

# Also download favicon / icon
fav_url = "https://static.wixstatic.com/media/41c832_06ee31991b604295bec930409ca16bfa~mv2.png/v1/fill/w_192,h_192,lg_1,usm_0.66_1.00_0.01/41c832_06ee31991b604295bec930409ca16bfa~mv2.png"
download_image(fav_url, inst_dir, "favicon_192.png")

# Save complete dataset
dataset = {
    'company': {
        'name': 'G11 Conceito Financeiro',
        'cnpj_or_founded': 'Fundada em 10 de agosto de 2021',
        'description': 'Assessoria especializada que conecta corretores de alta performance às principais instituições do mercado, oferecendo suporte estratégico para proteção patrimonial, seguros, previdência e investimentos.',
        'address': {
            'street': 'Av Antártica 675',
            'neighborhood': 'Jardim das Perdizes',
            'city': 'São Paulo',
            'state': 'SP',
            'cep': '05003-020',
            'full': 'Av Antártica 675, Perdizes - SP, 05003-020'
        },
        'contact': {
            'whatsapp': '+55 11 99160-6951',
            'whatsapp_link': 'https://wa.me/5511991606951?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es!',
            'instagram': 'https://www.instagram.com/g11conceitofinanceiro/',
            'hours': 'De segunda a sexta-feira das 9h às 18h (horário comercial)'
        },
        'logo': logo_path.replace('\\', '/') if logo_path else None
    },
    'covers': covers_data,
    'albums': albums_final
}

with open('site_complete_dataset.json', 'w', encoding='utf-8') as f:
    json.dump(dataset, f, indent=2, ensure_ascii=False)

print("\nCOMPLETE SITE DATASET SAVED TO site_complete_dataset.json!")
