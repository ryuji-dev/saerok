import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_UPLOAD_WIDTH = 1280;
const UPLOAD_COMPRESS = 0.6;

export type ProcessedImage = { uri: string; base64: string | null };

/**
 * 업로드 전 리사이즈 + JPEG 압축. 폭을 제한해 Storage 용량·업로드 대역폭을 줄인다.
 * SDK 56 의 컨텍스트형 API(manipulate → resize → renderAsync → saveAsync) 사용.
 * 원본이 maxWidth 보다 작으면 비율 유지로 확대될 수 있으나, 카메라 원본은 보통 그보다 크다.
 */
export async function resizeForUpload(uri: string, maxWidth = MAX_UPLOAD_WIDTH): Promise<ProcessedImage> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: maxWidth });
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: UPLOAD_COMPRESS, format: SaveFormat.JPEG, base64: true });
  return { uri: result.uri, base64: result.base64 ?? null };
}
