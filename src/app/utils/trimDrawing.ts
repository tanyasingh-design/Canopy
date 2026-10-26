/**
 * Trims transparent pixels around drawn artwork so images are tightly cropped
 * with no empty vertical space that pushes ground shadows far below the drawing.
 */

export function cropCanvasToArtwork(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  const w = canvas.width;
  const h = canvas.height;
  if (w <= 0 || h <= 0) return "";

  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch {
    return canvas.toDataURL("image/png");
  }

  const data = imgData.data;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let hasPixels = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > 12) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasPixels) return "";

  // Add 14px padding around the artwork
  const dpr = window.devicePixelRatio || 1;
  const pad = Math.round(14 * dpr);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w, maxX + pad);
  maxY = Math.min(h, maxY + pad);

  const cropW = maxX - minX;
  const cropH = maxY - minY;
  if (cropW <= 0 || cropH <= 0) return "";

  // Cap dimensions to max 400px
  const maxDim = 400;
  let finalW = cropW;
  let finalH = cropH;
  if (cropW > maxDim || cropH > maxDim) {
    if (cropW > cropH) {
      finalW = maxDim;
      finalH = Math.round(cropH * (maxDim / cropW));
    } else {
      finalH = maxDim;
      finalW = Math.round(cropW * (maxDim / cropH));
    }
  }

  const tmp = document.createElement("canvas");
  tmp.width = Math.max(1, finalW);
  tmp.height = Math.max(1, finalH);
  const tmpCtx = tmp.getContext("2d")!;
  tmpCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, finalW, finalH);

  return tmp.toDataURL("image/png");
}

export function trimDrawingImage(src: string): Promise<string> {
  return new Promise((resolve) => {
    if (!src || !src.startsWith("data:image")) {
      return resolve(src);
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth || img.width;
      c.height = img.naturalHeight || img.height;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve(src);
      ctx.drawImage(img, 0, 0);
      try {
        const cropped = cropCanvasToArtwork(c);
        resolve(cropped || src);
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}
