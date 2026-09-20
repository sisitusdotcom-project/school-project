import re
from pathlib import Path

base_dir = Path(r'e:\web-projects\MTSALITTIHADMLG.SCH.ID')

pages = [
    {
        'file': 'berita-prestasi-bulutangkis-zhafran.html',
        'title': 'Juara 2 Ganda Anak Putra Kejuaraan Bulutangkis 2025 | SD Muhammadiyah 1 Sedati',
        'desc': 'Zhafran Almer Haq, siswa kelas 6 Muadz SD Muhammadiyah 1 Sedati, berhasil meraih Juara 2 Ganda Anak Putra dalam Kejuaraan Bulutangkis Suryanaga Dharma Putra Kalimantan Sejati Cup 2025.',
        'url': 'https://musada.sch.id/berita-prestasi-bulutangkis-zhafran.html',
        'image': 'https://musada.sch.id/assets/img/berita/juara-2-ganda-anak-putra-bulutangkis-zhafran.webp'
    },
    {
        'file': 'berita-guru-berdedikasi-kohar.html',
        'title': 'Guru Berdedikasi 2025: M. Kohar, M.Pd. Raih Penghargaan | SD Muhammadiyah 1 Sedati',
        'desc': 'Bapak M. Kohar, M.Pd., Guru ISMUBA SD Muhammadiyah 1 Sedati, berhasil meraih Penghargaan Guru Berdedikasi dalam rangka Peringatan Hari Guru Nasional Tahun 2025.',
        'url': 'https://musada.sch.id/berita-guru-berdedikasi-kohar.html',
        'image': 'https://musada.sch.id/assets/img/berita/guru-berdedikasi-m-kohar-2025.webp'
    },
    {
        'file': 'berita-olimpiade-sains-riyan.html',
        'title': 'Juara 2 Olimpiade SAINS Obor Langit 2025 | SD Muhammadiyah 1 Sedati',
        'desc': 'Ananda Riyan Saffi Nararya Sudarsono, siswa kelas 6 Muadz SD Muhammadiyah 1 Sedati, berhasil meraih Juara 2 dalam Olimpiade SAINS Obor Langit yang diselenggarakan oleh Institut Cendikia Insan Mandiri.',
        'url': 'https://musada.sch.id/berita-olimpiade-sains-riyan.html',
        'image': 'https://musada.sch.id/assets/img/berita/juara-2-olimpiade-sains-obor-langit-riyan.webp'
    }
]

def fix_head(page):
    filepath = base_dir / page['file']
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. <title>
    html = re.sub(r'<title>.*?</title>', f'<title>{page["title"]}</title>', html, count=1)
    # 2. <meta name="description">
    html = re.sub(r'<meta name="description" content="[^"]*" />', f'<meta name="description" content="{page["desc"]}" />', html, count=1)
    # 3. <meta property="og:title">
    html = re.sub(r'<meta property="og:title" content="[^"]*" />', f'<meta property="og:title" content="{page["title"]}" />', html, count=1)
    # 4. <meta property="og:description">
    html = re.sub(r'<meta property="og:description" content="[^"]*" />', f'<meta property="og:description" content="{page["desc"]}" />', html, count=1)
    # 5. <meta property="og:url">
    html = re.sub(r'<meta property="og:url" content="[^"]*" />', f'<meta property="og:url" content="{page["url"]}" />', html, count=1)
    # 6. <meta property="og:image">
    html = re.sub(r'<meta property="og:image" content="[^"]*" />', f'<meta property="og:image" content="{page["image"]}" />', html, count=1)
    # 7. <meta name="twitter:title">
    html = re.sub(r'<meta name="twitter:title" content="[^"]*" />', f'<meta name="twitter:title" content="{page["title"]}" />', html, count=1)
    # 8. <meta name="twitter:description">
    html = re.sub(r'<meta name="twitter:description" content="[^"]*" />', f'<meta name="twitter:description" content="{page["desc"]}" />', html, count=1)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Fixed {page['file']}")

for p in pages:
    fix_head(p)
