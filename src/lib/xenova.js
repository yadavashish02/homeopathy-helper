import { pipeline } from '@xenova/transformers';
import { XENOVA_MODEL_NAME } from './config';

let embedder = null;

export async function getEmbeddingPipeline() {
  if (embedder) return embedder;

  embedder = await pipeline('feature-extraction', XENOVA_MODEL_NAME);

  return embedder;
}