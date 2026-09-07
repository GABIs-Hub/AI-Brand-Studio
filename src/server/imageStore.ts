import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 (S3-compatible) object storage for AI-rendered images.
// Server-side only — credentials never reach the browser.

let s3Client: S3Client | null = null;

export function isImageStoreConfigured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET
  );
}

function getS3(): S3Client | null {
  if (!isImageStoreConfigured()) return null;
  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
}

/**
 * Uploads a base64 data-URL image to R2 and returns a usable URL:
 *  - the public URL when R2_PUBLIC_BASE_URL is configured, or
 *  - a 7-day presigned URL otherwise.
 */
export async function uploadImageToStore(
  dataUrl: string,
  keyPrefix: string
): Promise<string> {
  const client = getS3();
  if (!client) throw new Error('Image storage (R2) is not configured.');

  const [meta, b64] = dataUrl.split(',');
  const mime = (meta.match(/^data:(.*?);base64/) || [])[1] || 'image/png';
  const ext = mime.includes('jpeg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
  const key = `${keyPrefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const body = Buffer.from(b64, 'base64');

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: body,
      ContentType: mime,
    })
  );

  if (process.env.R2_PUBLIC_BASE_URL) {
    return `${process.env.R2_PUBLIC_BASE_URL.replace(/\/+$/, '')}/${key}`;
  }
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }),
    { expiresIn: 7 * 24 * 60 * 60 }
  );
}