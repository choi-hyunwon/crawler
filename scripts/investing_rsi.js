const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  await page.goto('https://www.investing.com/equities/microsoft-corp-technical', { waitUntil: 'domcontentloaded', timeout: 60000 });

  // 쿠키/광고 팝업 닫기 (필요시)
  try {
    await page.click('button:has-text("동의")', { timeout: 3000 });
  } catch (e) {}

  // RSI(14) 값 추출
  const rsiValue = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tr'));
    for (const row of rows) {
      if (row.innerText.includes('RSI(14)')) {
        const tds = row.querySelectorAll('td');
        return tds[1]?.innerText.trim();
      }
    }
    return null;
  });

  console.log('RSI(14) 값:', rsiValue);

  await browser.close();
})(); 