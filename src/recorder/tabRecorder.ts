import { JSHandle, Page } from 'puppeteer';
import { TabRecorderStore } from '../global.js';
import { BrowserRecorder, BrowserRecorderSaveOptions } from './common.js';

interface PuppeteerTabRecorderOptions {
  audio?: boolean;
}

class PuppeteerTabRecorder implements BrowserRecorder {
  private page: Page;
  private recording: boolean = false;
  private paused: boolean = false;
  private storeHandle: JSHandle<TabRecorderStore> = null as never;

  private constructor(page: Page) {
    this.page = page;
  }

  get isRecording(): boolean {
    return this.recording && !this.paused;
  }

  // async constructor, should be called by createTabRecorder
  static async create(page: Page): Promise<PuppeteerTabRecorder> {
    const recorder = new PuppeteerTabRecorder(page);
    const alreadyExists = await page.evaluate(() => {
      return !!window.puppeteerTabRecorder;
    });
    if (alreadyExists) {
      throw new Error('PuppeteerTabRecorder already exists in the page.');
    }
    await page.evaluate(() => {
      window.puppeteerTabRecorder = {};
    });
    recorder.storeHandle = await page.evaluateHandle(() => window.puppeteerTabRecorder!);
    return recorder;
  }

  async getBlobUrl(): Promise<string> {
    const blobUrl = await (await this.storeHandle.getProperty('blobUrl')).jsonValue();
    if (!blobUrl) {
      throw new Error('No blob url found.');
    }
    return blobUrl;
  }

  async start(options: PuppeteerTabRecorderOptions = {}): Promise<void> {
    if (this.recording) {
      throw new Error('Recording in this page is already in progress.');
    }
    await this.page.evaluate(async (recordOptions: typeof options) => {
      // capture the current tab
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
        },
        audio: recordOptions.audio ? true : false,
        systemAudio: 'exclude',
        selfBrowserSurface: 'include',
        preferCurrentTab: true,
      });
      window.puppeteerTabRecorder!.mediaStream = stream;
      // create media recorder
      const recorder = new MediaRecorder(stream);
      window.puppeteerTabRecorder!.mediaRecorder = recorder;
      // register event listeners
      recorder.addEventListener('dataavailable', (event) => {
        const blobUrl = URL.createObjectURL(event.data);
        window.puppeteerTabRecorder!.blobUrl = blobUrl;
        window.handleRecorderDataAvailable!(blobUrl);
      });
      // start recording
      recorder.start();
    }, options);
    this.recording = true;
  }

  async stop(): Promise<void> {
    if (!this.recording) {
      throw new Error('Recording in this page is not started.');
    }
    await this.page.evaluate(async () => {
      window.puppeteerTabRecorder!.mediaRecorder!.stop();
      window.puppeteerTabRecorder!.mediaStream!.getTracks().forEach((track) => {
        track.stop();
      });
    });
    this.recording = false;
  }

  async pause(): Promise<void> {
    if (!this.recording) {
      throw new Error('Recording in this page is not started.');
    }
    if (this.paused) {
      throw new Error('Recording in this page is already paused.');
    }
    await this.page.evaluate(async () => {
      window.puppeteerTabRecorder!.mediaRecorder!.pause();
    });
    this.paused = true;
  }

  async resume(): Promise<void> {
    if (!this.recording) {
      throw new Error('Recording in this page is not started.');
    }
    if (!this.paused) {
      throw new Error('Recording in this page is not paused.');
    }
    await this.page.evaluate(async () => {
      window.puppeteerTabRecorder!.mediaRecorder!.resume();
    });
    this.paused = false;
  }

  async save(options: BrowserRecorderSaveOptions = {}): Promise<void> {
    const blobUrl = await (await this.storeHandle.getProperty('blobUrl')).jsonValue();
    if (!blobUrl) {
      throw new Error('No blob url found. Video is not recorded or already saved.');
    }
    await this.page.evaluate(
      async (filename) => {
        const a = document.createElement('a');
        a.href = window.puppeteerTabRecorder!.blobUrl!;
        a.download = filename;
        a.click();
      },
      (options.filename || 'recording.webm') satisfies `${string}.webm`
    );
    await this.deleteRecordedData();
  }

  private async deleteRecordedData(): Promise<void> {
    await this.page.evaluate(() => {
      URL.revokeObjectURL(window.puppeteerTabRecorder?.blobUrl ?? '');
      window.puppeteerTabRecorder!.blobUrl = undefined;
      window.puppeteerTabRecorder!.mediaStream = undefined;
      window.puppeteerTabRecorder!.mediaRecorder = undefined;
    });
  }
}

export default PuppeteerTabRecorder;
