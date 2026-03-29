import { File, Paths } from 'expo-file-system';

export async function saveThumbnail(
  base64Data: string,
  entryId: string,
): Promise<string> {
  const dir = Paths.document;
  const file = new File(dir, `entry-${entryId}.jpg`);
  // Write base64-decoded binary data
  const bytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  await file.write(bytes);
  return file.uri;
}
