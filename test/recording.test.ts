import { createTabRecorder, recommandChromeArgs } from '@src/index.js';
import { delay } from '@src/utils.js';
import puppeteer from 'puppeteer';
import { afterAll, beforeAll, expect, test } from 'vitest';

let browser: puppeteer.Browser;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: null,
    args: [...recommandChromeArgs],
  });
});

test('should get blob url', async () => {
  const page = await browser.newPage();
  await page.goto('https://developer.apple.com/');
  const recorder = await createTabRecorder(page);
  await recorder.start();
  await delay(1000);
  await recorder.stop();
  const blobUrl = await recorder.getBlobUrl();
  expect(blobUrl).toMatch(/^blob:/);
});

afterAll(async () => {
  await browser.close();
});
