# puppeteer-tab-recorder

Record a tab with puppeteer. Implemented using
[getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) and
[MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) API.

- ✅ Supports both headless and headful mode.
- ✅ Multiple tabs can be recorded at the same time.
- ✅ Supports audio recording, multiple tabs at the same time.
- ❌ Refresh and navigation to new URL will stop the recording (and recorded data won't be saved).

## Installation

```bash
pnpm add -D puppeteer-tab-recorder
```

## How to use

### Record a single tab

```ts
import puppeteer from 'puppeteer';
import { recommandChromeArgs, createTabRecorder } from 'puppeteer-tab-recorder';

// launch browser
const browser = await puppeteer.launch({
  headless: 'new', // use `'new'` for headless mode, and `false` for headful mode
  defaultViewport: null, // viewport will fit the window size
  args: [...recommandChromeArgs], // recommanded, for skipping capture window selection dialog
  // puppeteer is using 'Chrome for Testing', which doesn't have h264 codec support.
  // if you want to play videos using h264 codec, you need to use your own Chrome.
  executablePath: '<Optional, path to your Chrome>',
});

// open a new page
const page = await browser.newPage();

// go to the site you want to record
await page.goto('https://developers.google.com/);

// create recorder
const recorder = await createTabRecorder(page);

// start recording
await recorder.start(); // audio recording is enabled by default. to disable, use `recorder.start({ audio: false })`

// do something
await delay(5000);
// ...

// stop recording
await recorder.stop();

// save recording (only .webm is supported currently, saved to defulat download folder)
await recorder.save({ filename: 'recording.webm' });

// wait for download to finish
await delay(1000);

// close browser
await browser.close();
```

### Record multiple tabs

```ts
import puppeteer from 'puppeteer';
import { createTabRecorder, recommandChromeArgs } from 'puppeteer-tab-recorder';

const browser = await puppeteer.launch({
  headless: 'new',
  defaultViewport: null,
  args: [...recommandChromeArgs],
});

const page1 = await browser.newPage();
await page1.goto('https://developer.apple.com/');
const recorder1 = await createTabRecorder(page);
await recorder1.start({ audio: true });

const page2 = await browser.newPage();
await page2.goto('https://developer.apple.com/');
const recorder2 = await createTabRecorder(page);
await recorder2.start({ audio: true });

// record 2 tabs for 5 seconds at the same time, both with its own audio
await delay(5000);

await recorder1.stop();
await recorder2.stop();

await recorder1.save({ filename: 'recording1.webm' });
await recorder2.save({ filename: 'recording2.webm' });

await delay(1000);

await browser.close();
```

## Run examples

```bash
git clone https://github.com/reekystive/puppeteer-tab-recorder.git
cd puppeteer-tab-recorde
pnpm install
pnpm exec ts-node-esm -T examples/youtube.ts
```

![Screen Capture 2023-09-25 at 20 14 26](https://github.com/reekystive/puppeteer-tab-recorder/assets/26853900/342aa088-39bf-48a7-a42e-adc279615cdd)
