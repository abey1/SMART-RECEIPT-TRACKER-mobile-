import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const RECEIPTS_DIR = `${FileSystem.documentDirectory}receipts/`;

async function ensureReceiptsDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(RECEIPTS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(RECEIPTS_DIR, { intermediates: true });
  }
}

/**
 * Resize and persist a captured image; returns a stable file URI under documentDirectory.
 */
export async function saveReceiptImage(
  sourceUri: string,
  id: string
): Promise<string> {
  await ensureReceiptsDir();

  const manipulated = await manipulateAsync(
    sourceUri,
    [{ resize: { width: 1200 } }],
    { compress: 0.82, format: SaveFormat.JPEG }
  );

  const dest = `${RECEIPTS_DIR}${id}.jpg`;
  await FileSystem.copyAsync({ from: manipulated.uri, to: dest });
  return dest;
}
