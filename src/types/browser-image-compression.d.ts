declare module 'browser-image-compression' {
  interface Options {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    maxIteration?: number;
    exifOrientation?: number;
    fileType?: string;
    alwaysKeepResolution?: boolean;
    initialQuality?: number;
  }

  export default function imageCompression(
    file: File,
    options: Options
  ): Promise<File>;
} 