import crypto from 'node:crypto';
import path from 'node:path';

function storageConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'files';
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.');
  }
  return { supabaseUrl, serviceKey, bucket };
}

function objectUrl(bucket: string, objectPath: string) {
  return objectPath.split('/').map(encodeURIComponent).reduce(
    (url, segment, index) => url + (index ? '/' : '') + segment,
    `/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/`,
  );
}

async function storageRequest(url: string, init: RequestInit) {
  const { serviceKey } = storageConfig();
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase Storage request failed (${response.status}): ${body.slice(0, 300)}`);
  }
  return response;
}

export async function uploadToSupabase(file: Express.Multer.File, ownerId: number) {
  const { supabaseUrl, bucket } = storageConfig();
  const extension = path.extname(file.originalname).toLowerCase();
  const objectPath = `user-${ownerId}/${crypto.randomUUID()}${extension}`;
  const endpoint = `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath.split('/').map(encodeURIComponent).join('/')}`;
  await storageRequest(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': file.mimetype,
      'Cache-Control': 'max-age=3600',
      'x-upsert': 'false',
    },
    body: new Uint8Array(file.buffer),
  });
  return { url: `${supabaseUrl}${objectUrl(bucket, objectPath)}`, storageKey: objectPath };
}

export async function createStorageSignedUrl(storageKey: string, expiresIn: number, downloadName?: string) {
  const { supabaseUrl, bucket } = storageConfig();
  const endpoint = `${supabaseUrl}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${storageKey.split('/').map(encodeURIComponent).join('/')}`;
  const response = await storageRequest(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn }),
  });
  const result = await response.json() as { signedURL?: string };
  if (!result.signedURL) throw new Error('Supabase did not return a signed download URL');
  const signedUrl = result.signedURL.startsWith('http')
    ? new URL(result.signedURL)
    : new URL(`/storage/v1${result.signedURL.startsWith('/') ? result.signedURL : `/${result.signedURL}`}`, supabaseUrl);
  if (downloadName) signedUrl.searchParams.set('download', downloadName);
  return signedUrl.toString();
}

export async function deleteStorageObjects(storageKeys: string[]) {
  if (!storageKeys.length) return;
  const { supabaseUrl, bucket } = storageConfig();
  const endpoint = `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}`;
  await storageRequest(endpoint, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: storageKeys }),
  });
}
