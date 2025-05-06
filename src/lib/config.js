import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export const SYMPTOMS_COLLECTION = 'symptom_embeddings'
export const DB_NAME = process.env.DB_NAME
export const MONGODB_URI = process.env.MONGODB_URI;
export const XENOVA_MODEL_NAME = 'Xenova/all-MiniLM-L6-v2'
export const NUM_CANDIDATES = 400
export const LIMIT_SOLUTIONS = 15
export const LIMIT_SYMPTOMS = 150
export const VECTOR_INDEX_PATHS = Object.freeze({
    XENOVA: 'embedding'
})
export const SOLUTIONS_COLLECTION = Object.freeze({
    CLARKE: 'solutions_clarke'
})
export const VECTOR_INDEX_NAMES = Object.freeze({
    XENOVA: 'default'
})
