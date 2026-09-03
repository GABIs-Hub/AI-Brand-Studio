/**
 * High-Resolution Image & Vector Export Engine
 * Supports rasterizing 3D SVG scenes & AI renders to true HD PNGs (1K, 2K, 4K)
 * and direct vector downloads with cross-browser clipboard support.
 */

export interface RenderDimensions {
  width: number;
  height: number;
  label: string;
}

export function parseResolutionToDimensions(res: string): RenderDimensions {
  switch (res) {
    case '512px':
      return { width: 512, height: 512, label: '512px (Web Preview)' };
    case '1K':
      return { width: 1024, height: 1024, label: '1K HD (1024 × 1024)' };
    case '2K':
      return { width: 2048, height: 2048, label: '2K Quad-HD (2048 × 2048)' };
    case '4K':
      return { width: 4096, height: 4096, label: '4K Ultra-HD (4096 × 4096)' };
    default:
      return { width: 2048, height: 2048, label: '2K Quad-HD (2048 × 2048)' };
  }
}

/**
 * Safely converts Base64 / Data URI to a Blob without canvas dependencies
 */
export async function dataUriToBlob(dataUri: string): Promise<Blob> {
  try {
    const res = await fetch(dataUri);
    return await res.blob();
  } catch {
    // Manual fallback for environments where fetch dataUri is restricted
    const parts = dataUri.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
}

/**
 * Normalizes any SVG input (base64, data URI, or raw text) into clean, standalone SVG XML string
 */
export function extractCleanSvgText(svgSource: string): string {
  let cleanSvg = svgSource.trim();
  if (cleanSvg.startsWith('data:image/svg+xml;base64,')) {
    const base64Data = cleanSvg.replace('data:image/svg+xml;base64,', '');
    try {
      // Decode with UTF-8 support
      cleanSvg = decodeURIComponent(
        atob(base64Data)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      cleanSvg = atob(base64Data);
    }
  } else if (cleanSvg.startsWith('data:image/svg+xml,')) {
    cleanSvg = decodeURIComponent(cleanSvg.replace('data:image/svg+xml,', ''));
  }

  // Ensure unescaped ampersands in text/attributes are escaped for strict XML parsers
  cleanSvg = cleanSvg.replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;');

  // Ensure xmlns is present on root svg element
  if (!cleanSvg.includes('xmlns=')) {
    cleanSvg = cleanSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Ensure basic viewBox if not defined
  if (!cleanSvg.includes('viewBox=') && !cleanSvg.includes('viewbox=')) {
    cleanSvg = cleanSvg.replace('<svg', '<svg viewBox="0 0 1000 1000"');
  }

  return cleanSvg;
}

/**
 * Triggers a direct browser file download from a Blob
 */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 2000);
}

/**
 * Converts any image source (Base64 PNG, Base64 SVG, or raw SVG string)
 * into a pristine high-resolution PNG Blob and triggers a direct browser download.
 */
export async function downloadRenderAsPng(
  imageSource: string,
  filename: string,
  targetResolution = '2K'
): Promise<boolean> {
  const { width, height } = parseResolutionToDimensions(targetResolution);
  const outputFilename = filename.endsWith('.png') ? filename : `${filename}.png`;

  // 1. If it's already a raster PNG/JPEG base64 and user requested native download:
  const isRaster = imageSource.startsWith('data:image/png') || imageSource.startsWith('data:image/jpeg');
  if (isRaster && !imageSource.includes('svg')) {
    try {
      const blob = await dataUriToBlob(imageSource);
      triggerBlobDownload(blob, outputFilename);
      return true;
    } catch (e) {
      console.warn('Direct raster blob download failed, falling back to canvas draw:', e);
    }
  }

  // 2. Rasterize via high-precision 2D Canvas
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: true });

      if (!ctx) {
        throw new Error('Canvas 2D context is not available.');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      let imgSrc = imageSource;
      let blobUrlToRevoke: string | null = null;

      const isSvgSource =
        imageSource.trim().startsWith('<svg') ||
        imageSource.startsWith('data:image/svg+xml');

      if (isSvgSource) {
        const cleanSvg = extractCleanSvgText(imageSource);
        const svgBlob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
        imgSrc = URL.createObjectURL(svgBlob);
        blobUrlToRevoke = imgSrc;
      }

      const img = new Image();
      
      // CRITICAL: Only set crossOrigin for external http(s) URLs.
      // Setting crossOrigin on data: or blob: URIs causes browser security errors (e.g. [object Event]).
      if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        try {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          if (blobUrlToRevoke) {
            URL.revokeObjectURL(blobUrlToRevoke);
            blobUrlToRevoke = null;
          }

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // If canvas toBlob fails, download direct vector/raster source
                if (isSvgSource) {
                  downloadRenderAsSvg(imageSource, filename);
                  resolve(true);
                  return;
                }
                reject(new Error('Failed to generate PNG binary blob.'));
                return;
              }

              triggerBlobDownload(blob, outputFilename);
              resolve(true);
            },
            'image/png',
            1.0
          );
        } catch (drawErr) {
          if (blobUrlToRevoke) URL.revokeObjectURL(blobUrlToRevoke);
          // Fallback to direct SVG vector download if canvas security blocks rasterization
          if (isSvgSource) {
            downloadRenderAsSvg(imageSource, filename);
            resolve(true);
            return;
          }
          reject(drawErr);
        }
      };

      img.onerror = (err) => {
        if (blobUrlToRevoke) URL.revokeObjectURL(blobUrlToRevoke);
        console.warn('Canvas Image load error, initiating vector fallback:', err);
        // Fallback: direct SVG download so user gets their asset seamlessly
        if (isSvgSource) {
          const ok = downloadRenderAsSvg(imageSource, filename);
          if (ok) {
            resolve(true);
            return;
          }
        }
        reject(new Error('Failed to render image source to PNG.'));
      };

      img.src = imgSrc;
    } catch (e) {
      if (imageSource.includes('svg')) {
        downloadRenderAsSvg(imageSource, filename);
        resolve(true);
        return;
      }
      reject(e);
    }
  });
}

/**
 * Downloads the source as a native vector SVG file.
 */
export function downloadRenderAsSvg(svgSource: string, filename: string): boolean {
  try {
    const cleanSvg = extractCleanSvgText(svgSource);
    const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
    const outputFilename = filename.endsWith('.svg') ? filename : `${filename}.svg`;
    triggerBlobDownload(blob, outputFilename);
    return true;
  } catch (err) {
    console.error('Error downloading SVG:', err);
    return false;
  }
}

/**
 * Copies the rasterized PNG to system clipboard.
 */
export async function copyRenderToClipboard(imageSource: string): Promise<boolean> {
  try {
    const isSvgSource =
      imageSource.trim().startsWith('<svg') ||
      imageSource.startsWith('data:image/svg+xml');

    let imgSrc = imageSource;
    let blobUrlToRevoke: string | null = null;

    if (isSvgSource) {
      const cleanSvg = extractCleanSvgText(imageSource);
      const svgBlob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
      imgSrc = URL.createObjectURL(svgBlob);
      blobUrlToRevoke = imgSrc;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    return new Promise((resolve) => {
      const img = new Image();
      if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = async () => {
        ctx.clearRect(0, 0, 1024, 1024);
        ctx.drawImage(img, 0, 0, 1024, 1024);
        if (blobUrlToRevoke) URL.revokeObjectURL(blobUrlToRevoke);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(false);
            return;
          }
          try {
            if (navigator.clipboard && navigator.clipboard.write) {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'image/png': blob,
                }),
              ]);
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (clipErr) {
            console.warn('Clipboard write error:', clipErr);
            resolve(false);
          }
        }, 'image/png');
      };

      img.onerror = () => {
        if (blobUrlToRevoke) URL.revokeObjectURL(blobUrlToRevoke);
        resolve(false);
      };

      img.src = imgSrc;
    });
  } catch (e) {
    console.error('Copy to clipboard failed:', e);
    return false;
  }
}
