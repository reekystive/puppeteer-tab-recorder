import { Page } from 'puppeteer';
import PuppeteerTabRecorder from './recorder/tabRecorder.js';

async function createTabRecorder(page: Page) {
  const recorder = await PuppeteerTabRecorder.create(page);
  return recorder;
}

export { createTabRecorder };
