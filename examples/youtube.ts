/**
 * Run this example using:
 * pnpm exec ts-node-esm -T examples/youtube.ts
 */

import puppeteer from 'puppeteer';
import { createTabRecorder, recommandChromeArgs } from '../src/index.js';
import { delay } from './utils.js';

// launch browser
const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: null,
  args: [...recommandChromeArgs, '--window-size=1200,900'],
});

// open a new page
const page = await browser.newPage();

// go to the site you want to record
await page.goto('https://www.youtube.com/watch?v=RH6dE5tbDeQ');

// create recorder
const recorder = await createTabRecorder(page);

// start recording
await recorder.start(); // audio recording is enabled by default. to disable, use `recorder.start({ audio: false })`

await delay(5000);

// stop recording
await recorder.stop();

// save recording (only .webm is supported currently, saved to defulat download folder)
await recorder.save({ filename: 'video.webm' });

// wait for download to finish
await delay(1000);

// close browser
await browser.close();
