declare global {
  interface Window {
    puppeteerTabRecorder?: TabRecorderStore;
    handleRecorderDataAvailable?: (blobUrl: string) => void;
  }

  interface DisplayMediaStreamOptions {
    preferCurrentTab?: boolean;
    selfBrowserSurface?: 'include' | 'exclude';
    surfaceSwitching?: 'include' | 'exclude';
    systemAudio?: 'include' | 'exclude';
  }
}

interface TabRecorderStore {
  mediaStream?: MediaStream;
  mediaRecorder?: MediaRecorder;
  blobUrl?: string;
}

export { TabRecorderStore };
