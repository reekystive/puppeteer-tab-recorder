interface BrowserRecorderSaveOptions {
  filename?: `${string}.webm`;
}

abstract class BrowserRecorder {
  abstract start(): Promise<void>;
  abstract pause(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract save(options: BrowserRecorderSaveOptions): Promise<void>;
}

export { BrowserRecorder };

const recommandChromeArgs: string[] = [
  '--autoplay-policy=no-user-gesture-required',
  '--auto-accept-camera-and-microphone-capture',
  '--auto-accept-this-tab-capture',
  '--unsafely-treat-insecure-origin-as-secure="about:blank"',
];

export { BrowserRecorderSaveOptions, recommandChromeArgs };
