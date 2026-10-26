"use strict";
// Installed only for development/CI. No browser runtime dependency.
const { chromium, firefox, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const engine = require('../engine.js');

(async () => {
  const name = process.env.BROWSER || 'chromium';
  const browser = await ({chromium,firefox,webkit})[name].launch({headless:true});
  try {
    const context = await browser.newContext({offline:true, acceptDownloads:true});
    const page = await context.newPage();
    const errors = [], requests = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (/^https?:/.test(r.url())) requests.push(r.url()); });
    await page.goto(pathToFileURL(path.join(root,'index.html')).href);
    await page.locator('#language').selectOption('PHP');
    await page.locator('#diagnostic').selectOption('PEBKAC');
    await page.locator('#round').fill('12');
    await page.locator('#round').press('Tab');
    const original = fs.readFileSync(path.join(root,'tests/fixtures/maintainer-php.yaml'),'utf8');
    assert.equal(await page.locator('#yaml-preview').textContent(),original);
    assert.equal(await page.locator('#round-counter').textContent(),'013');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('#download').click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(),'dread-51c51d5853ef0b77-pebkac.yaml');
    assert.equal(fs.readFileSync(await download.path(),'utf8'),original);

    // Clipboard denial is an expected offline-browser state and has usable feedback.
    await page.evaluate(() => Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('test denial');}}}));
    await page.locator('#copy').click();
    assert.match(await page.locator('#notification').textContent(),/select the YAML/);
    await page.evaluate(() => Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text)=>{globalThis.testCopied=text;}}}));
    await page.locator('#copy').click();
    assert.equal(await page.evaluate(()=>globalThis.testCopied),original);

    await page.locator('#round').fill('-1');
    await page.locator('#round').press('Tab');
    assert.equal(await page.locator('#yaml-preview').textContent(),original);
    await page.locator('#language').selectOption('YAML');
    assert.equal(await page.locator('#round').inputValue(),'0');
    assert.equal(await page.locator('#round').evaluate(el=>el.checkValidity()),true);

    const beforeFraction = await page.locator('#yaml-preview').textContent();
    await page.locator('#round').fill('9007199254740990.1');
    await page.locator('#round').press('Tab');
    assert.equal(await page.locator('#yaml-preview').textContent(),beforeFraction,'fractional round must not silently become an integer');
    assert.equal(await page.locator('#round').evaluate(el=>el.checkValidity()),false);

    await page.locator('#round').fill('9007199254740991');
    await page.locator('#round').press('Tab');
    const last=await page.locator('#yaml-preview').textContent();
    await page.locator('#run').click();
    assert.equal(await page.locator('#yaml-preview').textContent(),last);
    assert.match(await page.locator('#notification').textContent(),/Maximum round/);

    const hostile='<img src=x onerror=alert(1)>\" & YAML';
    await page.locator('#seed').fill(hostile);
    await page.locator('#seed').press('Tab');
    assert.equal(await page.locator('#yaml-preview img').count(),0);
    assert.equal(await page.locator('#yaml-preview').textContent(),engine.toYAML(engine.generate({language:'YAML',code:'PEBKAC',seed:hostile,round:0})));
    await page.locator('#run').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#round').inputValue(),'1');
    await page.locator('#language').selectOption('Human Operator');
    assert.match(await page.locator('#advisory-id').textContent(),/^DREAD-9999-/);

    for (const width of [320,375,768,1280]) {
      await page.setViewportSize({width,height:900});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow at '+width);
      if(process.env.SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});
        await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`${name}-${width}.png`),fullPage:true});
      }
    }
    assert.deepEqual(errors,[]);
    assert.deepEqual(requests,[]);
    console.log(JSON.stringify({status:'PASS',browser:name,version:browser.version(),offline:true,widths:[320,375,768,1280],checks:['PHP fixture replay','download bytes and name','clipboard success/denial','invalid/max rounds','reset validity','text escaping','keyboard activation','Human Operator','no page errors','no HTTP requests']}));
    await context.close();
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
