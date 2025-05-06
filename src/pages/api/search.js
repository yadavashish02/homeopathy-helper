import { LIMIT_SOLUTIONS, LIMIT_SYMPTOMS, NUM_CANDIDATES, SYMPTOMS_COLLECTION, VECTOR_INDEX_NAMES, VECTOR_INDEX_PATHS } from '@/lib/config';
import { connectToDb } from '@/lib/mongodb';
import { getEmbeddingPipeline } from '@/lib/xenova';
import { getScoringAlgorithm } from '@/scoringAlgorithms/getScoringAlgorithm';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { query, sources } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "query" parameter' });
  }
  if (sources && !Array.isArray(sources)) {
     return res.status(400).json({ error: 'Invalid "sources" parameter, must be an array' });
  }

  try {
    const { db } = await connectToDb();
    const collection = db.collection(SYMPTOMS_COLLECTION);
    const embedder = await getEmbeddingPipeline();

    const queryEmbedding = await embedder(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(queryEmbedding.data);

    const vectorSearchStage = {
        $vectorSearch: {
          index: VECTOR_INDEX_NAMES.XENOVA,
          path: VECTOR_INDEX_PATHS.XENOVA,
          queryVector: queryVector,
          numCandidates: NUM_CANDIDATES,
          limit: LIMIT_SYMPTOMS
        }
    };

    // Enable source filtering if provided
    if (sources && sources.length > 0) {
       vectorSearchStage.$vectorSearch.filter = {
         source: { $in: sources }
       };
    }

    const aggregationPipeline = [
      vectorSearchStage,
      {
        $project: {
           _id: 0,
           solution_name: 1,
           original_organ_name: 1,
           source: 1,
           score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    const searchResults = await collection.aggregate(aggregationPipeline).toArray();

    const solutionAggregates = {};

    // First pass: collect all data
    searchResults.forEach(doc => {
      const solution = doc.solution_name;
      const similarityScore = doc.score;
      const organ = doc.original_organ_name.replace(/[^a-zA-Z]/g, '').trim();
      const source = doc.source;
    
      if (!(solution in solutionAggregates)) {
        solutionAggregates[solution] = {
          organScores: {},
          sourceScores: {},
          matchCount: 1,
          matching_organs: new Set([organ]),
          sources: new Set([source]),
          allScores: [similarityScore]
        };
      } else {
        const agg = solutionAggregates[solution];

        agg.matchCount += 1;
        agg.allScores.push(similarityScore);
        agg.matching_organs.add(organ);
        agg.sources.add(source);
        
        // Keep track of the highest score for each organ
        if (!agg.organScores[organ] || similarityScore > agg.organScores[organ]) {
          agg.organScores[organ] = similarityScore;
        }
        
        // Keep track of the highest score for each source
        if (!agg.sourceScores[source] || similarityScore > agg.sourceScores[source]) {
          agg.sourceScores[source] = similarityScore;
        }
      }
    });    

    // Second pass: compute final scores with a simplified and more balanced algorithm
    const finalRecommendations = Object.entries(solutionAggregates).map(([solutionName, agg]) => {
      const algorithm = getScoringAlgorithm();
      const {finalScore, avgScore} = algorithm.calculate(agg);
      
      return {
        solution: solutionName,
        score: parseFloat(finalScore.toFixed(4)),
        similarity: parseFloat((avgScore * 100).toFixed(0)),
        matching_organs: Array.from(agg.matching_organs),
        matching_sources: Array.from(agg.sources),
      };
    });

    // Sort by final score and take top results
    finalRecommendations.sort((a, b) => b.score - a.score);
    const topSolutions = finalRecommendations.slice(0, LIMIT_SOLUTIONS);
    
    res.status(200).json(topSolutions);

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}