import asyncio
from playwright.async_api import async_playwright
import os

# Create screenshots directory if it doesn't exist
os.makedirs('screenshots', exist_ok=True)

projects = {
    'brand-guideline.png': 'https://www.behance.net/gallery/237156179/Brand-Guideline',
    'dodge-challenger.png': 'https://www.behance.net/gallery/235026381/Dodge-Challenger-Unleash-the-Beast-Poster-Design',
    'real-estate.png': 'https://www.behance.net/gallery/195717199/REAL-ESTATE-WORK-DESIGNED-BY-ME',
    'website-ui-mockup.png': 'https://www.behance.net/gallery/234992265/Website-Design-UI-Mockup',
    'website-mockup-figma.png': 'https://www.behance.net/gallery/237155767/Website-Mockup-Design-Figma',
    'salon-skincare.png': 'https://www.behance.net/gallery/236579567/Modern-Salon-Skincare-Website-Design',
    'calendar-design.png': 'https://www.behance.net/gallery/195717845/CALENDAR-DESIGN',
    'brickmmo-uptime.png': 'https://brickmmo-uptime.infinityfreeapp.com/',
    'fitjourney.png': 'https://fitjourney-1.onrender.com/',
    'dodge-game.png': 'https://pallavidhawan72.github.io/Dodge-game/',
    'fortune-cookie.png': 'https://pallavidhawan72.github.io/Fortune-Cookie/'
}

async def capture_screenshot(page, filename, url):
    try:
        print(f'📸 Capturing {filename} from {url}...')
        await page.goto(url, wait_until='networkidle', timeout=30000)
        await page.wait_for_timeout(2000)  # Wait 2 seconds for images to load
        
        # Take screenshot
        await page.screenshot(
            path=f'screenshots/{filename}',
            full_page=False,  # Just capture viewport
            type='png'
        )
        print(f'✓ Successfully captured {filename}')
        return True
    except Exception as e:
        print(f'✗ Failed to capture {filename}: {str(e)}')
        return False

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1200, 'height': 800},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        page = await context.new_page()
        
        successful = 0
        failed = 0
        
        for filename, url in projects.items():
            result = await capture_screenshot(page, filename, url)
            if result:
                successful += 1
            else:
                failed += 1
            await asyncio.sleep(1)  # Be nice to servers
        
        await browser.close()
        
        print(f'\n✓ Successfully captured: {successful}')
        print(f'✗ Failed: {failed}')
        print(f'\nScreenshots saved in: screenshots/')

if __name__ == '__main__':
    asyncio.run(main())
