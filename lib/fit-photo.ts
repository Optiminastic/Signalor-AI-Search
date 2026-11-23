/**
 * Shrink a photo in the browser so it fits an upload size limit.
 *
 * A file already under the limit is returned untouched. Otherwise it is redrawn
 * as a JPEG, first at the original size with falling quality, then smaller,
 * until it fits. Returns null when it can't be made to fit or the file isn't a
 * readable image.
 */
const QUALITIES = [0.9, 0.8, 0.7]
const SCALE_STEP = 0.8
const MAX_ROUNDS = 6
const JPEG = 'image/jpeg'

interface FitOptions {
  maxBytes: number
  minSide: number
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, JPEG, quality))
}

function draw(image: ImageBitmap, scale: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas
}

async function firstFit(canvas: HTMLCanvasElement, maxBytes: number): Promise<Blob | null> {
  for (const quality of QUALITIES) {
    const blob = await encode(canvas, quality)
    if (blob && blob.size <= maxBytes) return blob
  }
  return null
}

export async function fitPhoto(
  file: File,
  { maxBytes, minSide }: FitOptions,
): Promise<Blob | null> {
  if (file.size <= maxBytes) return file
  const image = await createImageBitmap(file).catch(() => null)
  if (!image) return null
  let scale = 1
  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    if (Math.min(image.width, image.height) * scale < minSide) break
    const blob = await firstFit(draw(image, scale), maxBytes)
    if (blob) return blob
    scale *= SCALE_STEP
  }
  return null
}
