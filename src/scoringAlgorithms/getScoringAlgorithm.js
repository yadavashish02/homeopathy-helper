import { Intelligent, TFIDF } from "./claude";

let algo = null;

export const getScoringAlgorithm = () => {
    if (!algo) algo = new TFIDF();
    return algo;
}