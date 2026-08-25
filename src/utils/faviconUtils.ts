// Favicon & Web Icon Generation Utilities

export interface FaviconSpec {
  size: number;
  name: string;
  label: string;
  usage: string;
  type: 'png' | 'ico';
}

export const FAVICON_SPECS: FaviconSpec[] = [
  { size: 16, name: 'favicon-16x16.png', label: '16 × 16 px', usage: 'Standard Desktop Browser Tabs', type: 'png' },
  { size: 32, name: 'favicon-32x32.png', label: '32 × 32 px', usage: 'Retina & High-DPI Browser Tabs', type: 'png' },
  { size: 48, name: 'favicon-48x48.png', label: '48 × 48 px', usage: 'Windows Desktop Site Shortcut', type: 'png' },
  { size: 64, name: 'favicon-64x64.png', label: '64 × 64 px', usage: 'High-Res Bookmark Icons', type: 'png' },
  { size: 180, name: 'apple-touch-icon.png', label: '180 × 180 px', usage: 'Apple iOS Safari Home Screen', type: 'png' },
  { size: 192, name: 'android-chrome-192x192.png', label: '192 × 192 px', usage: 'Android Chrome Web App Icon', type: 'png' },
  { size: 512, name: 'android-chrome-512x512.png', label: '512 × 512 px', usage: 'PWA Splash Screen & App Stores', type: 'png' },
];

export interface FaviconRenderOptions {
  background: 'transparent' | 'dark' | 'primary' | 'light' | 'white' | 'custom';
  customBgColor?: string;
  paddingPercent: number; // 0 to 40
  borderRadiusPercent: number; // 0 to 50
  invertSvgColors?: boolean;
}

/**
 * Extracts clean standalone SVG string and ensures correct namespace, viewBox, and dimensions
 */
export function extractCleanSvg(svgString: string): string {
  if (!svgString || typeof svgString !== 'string') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="20" fill="#1E40AF"/><text x="50" y="62" font-size="36" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">B</text></svg>`;
  }

  let clean = svgString.trim();

  // Extract <svg ... </svg> if wrapped in other markup
  const match = clean.match(/<svg[\s\S]*?<\/svg>/i);
  if (match) {
    clean = match[0];
  }

  // Ensure xmlns is present for standalone rendering
  if (!clean.includes('xmlns="http://www.w3.org/2000/svg"') && !clean.includes("xmlns='http://www.w3.org/2000/svg'")) {
    clean = clean.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Ensure viewBox is present
  if (!clean.includes('viewBox=') && !clean.includes('viewbox=')) {
    clean = clean.replace(/<svg/i, '<svg viewBox="0 0 100 100"');
  }

  // Ensure explicit width and height so browser Image() can reliably calculate intrinsic dimensions
  if (!clean.includes('width=')) {
    clean = clean.replace(/<svg/i, '<svg width="100"');
  }
  if (!clean.includes('height=')) {
    clean = clean.replace(/<svg/i, '<svg height="100"');
  }

  return clean;
}

/**
 * Renders fallback lettermark or geometry directly on canvas if SVG parsing fails in Image()
 */
function drawCanvasFallback(
  ctx: CanvasRenderingContext2D,
  size: number,
  padding: number,
  fallbackColor: string
) {
  const drawSize = size - padding * 2;
  const offset = padding;
  ctx.save();
  ctx.fillStyle = fallbackColor || '#1E40AF';
  ctx.beginPath();
  const radius = drawSize * 0.15;
  ctx.roundRect(offset, offset, drawSize, drawSize, radius);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.round(drawSize * 0.5)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', size / 2, size / 2 + drawSize * 0.04);
  ctx.restore();
}

/**
 * Renders SVG onto an HTML Canvas at exact pixel dimensions with configurable background and padding
 */
export function renderSvgToCanvas(
  svgString: string,
  size: number,
  options: FaviconRenderOptions,
  brandColors?: { primary: string; dark: string; light: string }
): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(canvas);
      return;
    }

    // Determine background fill
    let bgColor = 'transparent';
    if (options.background === 'dark') bgColor = brandColors?.dark || '#0F172A';
    else if (options.background === 'primary') bgColor = brandColors?.primary || '#1E40AF';
    else if (options.background === 'light') bgColor = brandColors?.light || '#F8F9FA';
    else if (options.background === 'white') bgColor = '#FFFFFF';
    else if (options.background === 'custom' && options.customBgColor) bgColor = options.customBgColor;

    // Draw background if not transparent
    if (bgColor !== 'transparent') {
      const radius = (options.borderRadiusPercent / 100) * (size / 2);
      ctx.fillStyle = bgColor;
      if (radius > 0) {
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, radius);
        ctx.fill();
        ctx.clip();
      } else {
        ctx.fillRect(0, 0, size, size);
      }
    }

    const padding = (options.paddingPercent / 100) * size;
    const drawSize = Math.max(1, size - padding * 2);
    const offset = padding;

    // Clean and prepare SVG
    const cleanSvg = extractCleanSvg(svgString);
    const encodedSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
    const img = new Image();

    let resolved = false;

    const finalize = (success: boolean) => {
      if (resolved) return;
      resolved = true;
      if (success) {
        try {
          ctx.drawImage(img, offset, offset, drawSize, drawSize);
        } catch {
          drawCanvasFallback(ctx, size, padding, brandColors?.primary || '#1E40AF');
        }
      } else {
        drawCanvasFallback(ctx, size, padding, brandColors?.primary || '#1E40AF');
      }
      resolve(canvas);
    };

    img.onload = () => finalize(true);
    img.onerror = () => {
      // If data URL failed, try Blob object URL as secondary fallback
      try {
        const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const secondaryImg = new Image();
        secondaryImg.onload = () => {
          URL.revokeObjectURL(blobUrl);
          try {
            ctx.drawImage(secondaryImg, offset, offset, drawSize, drawSize);
          } catch {
            drawCanvasFallback(ctx, size, padding, brandColors?.primary || '#1E40AF');
          }
          if (!resolved) {
            resolved = true;
            resolve(canvas);
          }
        };
        secondaryImg.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          finalize(false);
        };
        secondaryImg.src = blobUrl;
      } catch {
        finalize(false);
      }
    };

    img.src = encodedSvg;
  });
}

/**
 * Converts canvas to PNG Blob
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to convert canvas to blob'));
    }, 'image/png');
  });
}

/**
 * Builds a standard binary .ICO file container containing 16x16, 32x32, and 48x48 PNG frames
 */
export async function createMultiSizeIco(
  svgString: string,
  options: FaviconRenderOptions,
  brandColors?: { primary: string; dark: string; light: string }
): Promise<Blob> {
  const icoSizes = [16, 32, 48];
  const pngBlobs: { size: number; buffer: ArrayBuffer }[] = [];

  for (const size of icoSizes) {
    const canvas = await renderSvgToCanvas(svgString, size, options, brandColors);
    const blob = await canvasToBlob(canvas);
    const buffer = await blob.arrayBuffer();
    pngBlobs.push({ size, buffer });
  }

  // Calculate ICO header & directory structure
  // Header: 6 bytes
  // Directory: 16 bytes per image (3 * 16 = 48 bytes)
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = pngBlobs.length;
  let offset = headerSize + numImages * dirEntrySize;

  const totalSize = offset + pngBlobs.reduce((acc, p) => acc + p.buffer.byteLength, 0);
  const icoBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(icoBuffer);

  // 1. Write Header
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type 1 = Icon
  view.setUint16(4, numImages, true); // Number of images

  // 2. Write Directory Entries
  let currentOffset = offset;
  for (let i = 0; i < numImages; i++) {
    const { size, buffer } = pngBlobs[i];
    const entryOffset = headerSize + i * dirEntrySize;

    view.setUint8(entryOffset + 0, size === 256 ? 0 : size); // Width
    view.setUint8(entryOffset + 1, size === 256 ? 0 : size); // Height
    view.setUint8(entryOffset + 2, 0); // Palette count
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(entryOffset + 8, buffer.byteLength, true); // Image byte size
    view.setUint32(entryOffset + 12, currentOffset, true); // Data offset

    // Copy PNG image data bytes into position
    const targetUint8 = new Uint8Array(icoBuffer, currentOffset, buffer.byteLength);
    targetUint8.set(new Uint8Array(buffer));

    currentOffset += buffer.byteLength;
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}
