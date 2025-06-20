const { chromium } = require('playwright');
const targets = require('./investing_rsi_targets');
const { uploadToNotion } = require('./notion_upload');

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function getRSI(url, label) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  try {
    await page.click('button:has-text("동의")', { timeout: 3000 });
  } catch (e) {}

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

  await browser.close();

  if (rsiValue) {
    const rsiValueFloat = parseFloat(rsiValue);
    let signal = '중립';
    if (rsiValueFloat > 70) {
      signal = '과매수';
    } else if (rsiValueFloat < 30) {
      signal = '과매도';
    }

    await uploadToNotion({
      label,
      rsi_value: rsiValueFloat,
      fetched_at: getTodayStr(),
      signal,
    });
 
  } else {
    console.log(`${label} RSI(14) 값을 찾지 못했습니다.`);
  }
}

(async () => {
  for (const { url, label } of targets) {
    await getRSI(url, label);
  }

})(); 