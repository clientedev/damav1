import os
import sys
import shutil
import json

sys.stdout.reconfigure(encoding='utf-8')

src_outros = os.path.join('assets', 'images', 'outros')

def copy_asset(media_id, dest_subdir, new_name):
    dest_dir = os.path.join('assets', 'images', dest_subdir)
    os.makedirs(dest_dir, exist_ok=True)
    src_path = os.path.join(src_outros, media_id)
    dest_path = os.path.join(dest_dir, new_name)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
        print(f"Copied {media_id} -> {dest_path}")
        return dest_path.replace('\\', '/')
    else:
        print(f"NOT FOUND: {src_path}")
        return None

print("=== ORGANIZING BRANDING & INSTITUTIONAL ASSETS ===")
b_logo = copy_asset('41c832_06ee31991b604295bec930409ca16bfa~mv2.png', 'branding', 'logo_principal.png')
b_footer_logo = copy_asset('d4f942_d8ed03e87ba544ee8debea09e11d3012~mv2.png', 'branding', 'logo_nav_footer.png')
b_g11_badge = copy_asset('d4f942_63aac0a4a32745ac82d0bef7cd723328~mv2.png', 'branding', 'logo_badge_sm.png')
b_g11_logo2 = copy_asset('d4f942_c1754a53c9644e78b83f0bcfed882a0b~mv2.png', 'branding', 'logo_badge_lg.png')
b_parceiros = copy_asset('41c832_8f504e51d7b04358b8ddee2f3a5f4f94~mv2.png', 'branding', 'parceiros_g11_grid.png')
b_omint = copy_asset('d4f942_3b81bebc5a07483d9aa0772a82a2531f~mv2.png', 'branding', 'parceiro_omint.png')

print("\n=== ORGANIZING HERO & INSTITUTIONAL BANNERS ===")
h_banner = copy_asset('d4f942_1f42014f21fa4c1d9b3af017c50a10a2~mv2.png', 'institucional', 'hero_home_banner.png')
h_sobre = copy_asset('baac51_a04dbd2607da4e50ad3dffc014a825ab~mv2.jpg', 'institucional', 'sobre_empresa_banner.jpg')
h_sobre_art = copy_asset('d4f942_e9fb0ba618d44d9baf5d803fc72d5c4e~mv2.png', 'institucional', 'sobre_g11_arte.png')
h_team = copy_asset('d4f942_9968c730b8a54af29c864d88d9535f96~mv2.jpeg', 'institucional', 'conheca_g11_equipe.jpg')

print("\n=== ORGANIZING PRODUTOS ASSETS ===")
p_vida = copy_asset('d4f942_819227482b2f47269b156cb9ac672b69~mv2.png', 'produtos', 'card_produto_1_vida.png')
p_viagem = copy_asset('d4f942_c72952261dd8405f984d1ec6747bafe8~mv2.png', 'produtos', 'card_produto_2_viagem.png')
p_previdencia = copy_asset('d4f942_178eef2db9024df59d7ded6a8839ebca~mv2.png', 'produtos', 'card_produto_3_previdencia.png')
p_saude = copy_asset('d4f942_a568b34854f847c8ae909ed7551bb02e~mv2.png', 'produtos', 'card_produto_4_saude.png')

print("\n=== CREATING COMPLETE METADATA REPOSITORY ===")

# Create a clean metadata JSON with all texts, structure, contacts, products, and album lists
final_structure = {
    "site_info": {
        "title": "G11 Conceito Financeiro",
        "tagline": "Soluções Financeiras Personalizadas para Corretores e Clientes de Alta Performance",
        "description": "Fundada em 10 de agosto de 2021, a G11 nasceu para auxiliar corretores de alta performance na transição de carreira, conectando-os às principais instituições do mercado e proporcionando suporte para que atuem de forma estratégica e eficiente.",
        "founded_date": "10 de agosto de 2021",
        "address": {
            "street": "Av Antártica 675",
            "neighborhood": "Jardim das Perdizes",
            "city": "São Paulo",
            "state": "SP",
            "cep": "05003-020",
            "full_formatted": "Av Antártica 675, Perdizes - SP, 05003-020",
            "google_maps_url": "https://maps.google.com/?q=Av+Antartica+675+Perdizes+Sao+Paulo+SP"
        },
        "contact": {
            "whatsapp": "+55 11 99160-6951",
            "whatsapp_url": "https://wa.me/5511991606951?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es!",
            "instagram": "https://www.instagram.com/g11conceitofinanceiro/",
            "business_hours": "De segunda a sexta-feira, das 9h às 18h (horário comercial)"
        },
        "branding": {
            "logo_principal": "assets/images/branding/logo_principal.png",
            "logo_nav_footer": "assets/images/branding/logo_nav_footer.png",
            "logo_badge": "assets/images/branding/logo_badge_lg.png",
            "parceiros_grid": "assets/images/branding/parceiros_g11_grid.png",
            "parceiro_omint": "assets/images/branding/parceiro_omint.png"
        }
    },
    "institucional": {
        "conheca_g11": {
            "title": "Conheça a G11 Conceito Financeiro",
            "text": "Fundada em 10 de agosto de 2021, a G11 nasceu para auxiliar corretores de alta performance na transição de carreira, conectando-os às principais instituições do mercado. Com inovação e suporte contínuo, a G11 se tornou referência, criando oportunidades para corretores construírem carreiras sólidas e rentáveis.",
            "image": "assets/images/institucional/conheca_g11_equipe.jpg",
            "hero_image": "assets/images/institucional/hero_home_banner.png"
        },
        "sobre_detalhado": {
            "title": "Sobre a G11",
            "banner_image": "assets/images/institucional/sobre_empresa_banner.jpg",
            "art_image": "assets/images/institucional/sobre_g11_arte.png",
            "missao": "Auxiliar corretores de alta performance na transição de carreira, conectando-os às principais instituições do mercado e proporcionando suporte para que atuem de forma estratégica e eficiente.",
            "visao": "Ser uma referência no setor, oferecendo oportunidades e soluções que contribuam para o crescimento e a consolidação dos corretores no mercado.",
            "valores": [
                {
                    "item": "Excelência",
                    "descricao": "Compromisso com a qualidade e a melhoria contínua."
                },
                {
                    "item": "Conexão",
                    "descricao": "Facilitação do acesso a instituições e oportunidades estratégicas."
                },
                {
                    "item": "Inovação",
                    "descricao": "Busca constante por soluções que agreguem valor ao mercado."
                },
                {
                    "item": "Transparência",
                    "descricao": "Atuação ética e clara em todas as relações."
                },
                {
                    "item": "Desenvolvimento",
                    "descricao": "Incentivo ao aprimoramento profissional e à evolução contínua."
                }
            ]
        }
    },
    "produtos": [
        {
            "id": "vida",
            "nome": "Seguro de Vida",
            "tag": "Vida",
            "descricao": "Segurança financeira para sua família em qualquer momento. Planos que garantem amparo e proteção quando mais importa.",
            "card_image": "assets/images/produtos/card_produto_1_vida.png"
        },
        {
            "id": "viagem",
            "nome": "Seguro Viagem",
            "tag": "Viagem",
            "descricao": "Viaje com tranquilidade! Cobertura para imprevistos, como despesas médicas, bagagem extraviada e muito mais.",
            "card_image": "assets/images/produtos/card_produto_2_viagem.png"
        },
        {
            "id": "previdencia",
            "nome": "Previdência Privada",
            "tag": "Previdência",
            "descricao": "Planeje seu futuro com segurança. Investimentos inteligentes para uma aposentadoria tranquila e estável.",
            "card_image": "assets/images/produtos/card_produto_3_previdencia.png"
        },
        {
            "id": "saude",
            "nome": "Plano de Saúde",
            "tag": "Saúde",
            "descricao": "Cuide do que mais importa! Planos de saúde que oferecem acesso a uma rede de qualidade para você e sua família.",
            "card_image": "assets/images/produtos/card_produto_4_saude.png"
        }
    ],
    "beneficios_exclusivos": {
        "title": "Benefícios Pagos & Exclusivos",
        "description": "Além dos nossos serviços essenciais, oferecemos benefícios exclusivos para quem busca ainda mais proteção, conforto e segurança. Invista no seu bem-estar e no da sua família com opções personalizadas para cada necessidade.",
        "itens": [
            {
                "nome": "Assistência 24h",
                "descricao": "Suporte em emergências para garantir tranquilidade em qualquer momento."
            },
            {
                "nome": "Seguro Residencial",
                "descricao": "Proteja seu lar contra imprevistos com coberturas especiais."
            },
            {
                "nome": "Seguro Odontológico",
                "descricao": "Cuide da sua saúde bucal com planos acessíveis e ampla cobertura."
            },
            {
                "nome": "Auxílio-Funeral",
                "descricao": "Amparo financeiro e suporte em momentos difíceis."
            },
            {
                "nome": "Descontos Exclusivos",
                "descricao": "Acesso a vantagens em redes parceiras de saúde, lazer e bem-estar."
            }
        ]
    },
    "depoimentos": [
        {
            "nome": "André S.",
            "cargo": "Corretor de Seguros",
            "depoimento": "A G11 transformou minha forma de lidar com dinheiro! Como corretor, nunca tive um planejamento financeiro estruturado, e hoje me sinto muito mais seguro sobre meu futuro."
        },
        {
            "nome": "Mariana R.",
            "cargo": "Corretora Parceira",
            "depoimento": "Graças à assessoria da G11, consegui organizar minhas comissões e investir de maneira inteligente. Agora sei que minha aposentadoria está garantida!"
        },
        {
            "nome": "Carlos M.",
            "cargo": "Cliente G11",
            "depoimento": "Sempre tive dúvidas sobre seguro de vida e previdência privada, mas a equipe da G11 me explicou tudo com clareza e transparência. Hoje, minha família está protegida!"
        },
        {
            "nome": "Fernanda L.",
            "cargo": "Corretora de Alta Performance",
            "depoimento": "O suporte da G11 foi essencial para otimizar meus ganhos como corretor. Além disso, me ajudaram a escolher um plano de saúde ideal para minha realidade!"
        }
    ],
    "sinistro": {
        "title": "Sobre Sinistro",
        "o_que_e": {
            "pergunta": "O que é um sinistro?",
            "resposta": "Um sinistro é qualquer evento inesperado que cause danos e esteja previsto no contrato de seguro. Quando isso acontece, o segurado pode acionar a seguradora para obter indenização, reembolso ou reparo, conforme os termos da apólice."
        },
        "como_registrar": {
            "pergunta": "Como registrar um sinistro?",
            "passos": [
                "Entre em contato com a seguradora imediatamente pelo telefone ou aplicativo.",
                "Reúna a documentação necessária, como boletim de ocorrência, fotos do ocorrido e nota fiscal dos bens danificados.",
                "Acompanhe a análise do sinistro pela seguradora e aguarde a resolução."
            ]
        },
        "cta_contato": "Entrar em contato via WhatsApp (+55 11 99160-6951)"
    }
}

# Now add the comprehensive Albums & Galleries structure with all paths
with open('site_complete_dataset.json', encoding='utf-8') as f:
    orig_dataset = json.load(f)

final_structure['galeria_realizacoes'] = {
    "title": "Realizações",
    "description": "Viagens de incentivo, convenções internacionais, premiações e eventos exclusivos da G11 Conceito Financeiro.",
    "capas_grid": orig_dataset.get('covers', []),
    "albuns_completos": orig_dataset.get('albums', [])
}

with open('site_data_final.json', 'w', encoding='utf-8') as f:
    json.dump(final_structure, f, indent=2, ensure_ascii=False)

print("\nSUCCESS! Saved site_data_final.json with full hierarchy!")
