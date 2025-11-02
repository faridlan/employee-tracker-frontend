// src/types/dom-to-image-more.d.ts
declare module "dom-to-image-more" {
  export interface DomToImageOptions {
    bgcolor?: string;
    quality?: number;
    style?: Record<string, string | number>;
    filter?: (node: HTMLElement) => boolean;
    width?: number;
    height?: number;
    cacheBust?: boolean;
    imagePlaceholder?: string;
  }

  export function toPng(
    node: HTMLElement,
    options?: DomToImageOptions
  ): Promise<string>;
  export function toJpeg(
    node: HTMLElement,
    options?: DomToImageOptions
  ): Promise<string>;
  export function toBlob(
    node: HTMLElement,
    options?: DomToImageOptions
  ): Promise<Blob>;
  export function toSvg(
    node: HTMLElement,
    options?: DomToImageOptions
  ): Promise<string>;
  export function toPixelData(
    node: HTMLElement,
    options?: DomToImageOptions
  ): Promise<Uint8Array>;
  export function toCanvas(
    node: HTMLElement,
    options?: DomToImageOptions
  ): Promise<HTMLCanvasElement>;

  const domtoimage: {
    toPng: typeof toPng;
    toJpeg: typeof toJpeg;
    toBlob: typeof toBlob;
    toSvg: typeof toSvg;
    toPixelData: typeof toPixelData;
    toCanvas: typeof toCanvas;
  };

  export default domtoimage;
}
