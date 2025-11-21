import urllib.request
import re
import json

urls = {
    'Brand Guideline': 'https://www.behance.net/gallery/237156179/Brand-Guideline',
    'Dodge Challenger': 'https://www.behance.net/gallery/235026381/Dodge-Challenger-Unleash-the-Beast-Poster-Design',
    'Real Estate': 'https://www.behance.net/gallery/195717199/REAL-ESTATE-WORK-DESIGNED-BY-ME',
    'Website Design UI Mockup': 'https://www.behance.net/gallery/234992265/Website-Design-UI-Mockup',
    'Website Mockup Figma': 'https://www.behance.net/gallery/237155767/Website-Mockup-Design-Figma',
    'Salon Skincare': 'https://www.behance.net/gallery/236579567/Modern-Salon-Skincare-Website-Design',
    'Calendar Design': 'https://www.behance.net/gallery/195717845/CALENDAR-DESIGN',
    'BrickMMO Uptime': 'https://brickmmo-uptime.infinityfreeapp.com/',
    'FitJourney': 'https://fitjourney-1.onrender.com/',
    'Dodge Game': 'https://pallavidhawan72.github.io/Dodge-game/',
    'Fortune Cookie': 'https://pallavidhawan72.github.io/Fortune-Cookie/'
}

results = {}

for name, url in urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Try different meta tags for images
            patterns = [
                r'<meta property="og:image" content="([^"]+)"',
                r'<meta name="og:image" content="([^"]+)"',
                r'<meta property="twitter:image" content="([^"]+)"',
                r'<link rel="image_src" href="([^"]+)"'
            ]
            
            image_url = None
            for pattern in patterns:
                match = re.search(pattern, html)
                if match:
                    image_url = match.group(1)
                    break
            
            if image_url:
                results[name] = image_url
                print(f'✓ {name}: {image_url}')
            else:
                print(f'✗ {name}: No image found')
                
    except Exception as e:
        print(f'✗ {name}: ERROR - {str(e)}')

print('\n--- Results ---')
print(json.dumps(results, indent=2))
