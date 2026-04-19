import { env } from '../config/env';
import type { Receipt } from '../types';

export interface UploadReceiptResult {
  ok: boolean;
  message?: string;
}

/**
 * Sends receipt image and metadata to your backend (multipart).
 * Replace `env.apiBaseUrl` and headers with your API contract.
 */
export async function uploadReceiptToBackend(
  receipt: Receipt,
  accessToken?: string | null
): Promise<UploadReceiptResult> {
  const url = `${env.apiBaseUrl.replace(/\/$/, '')}/receipts`;

  const form = new FormData();
  form.append('date', receipt.date);
  form.append('image', {
    uri: receipt.imageUri,
    name: `receipt-${receipt.id}.jpg`,
    type: 'image/jpeg',
  } as unknown as Blob);

  const headers: HeadersInit = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: form,
      headers,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        message: text || `Upload failed (${res.status})`,
      };
    }

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Network error';
    return { ok: false, message };
  }
}
