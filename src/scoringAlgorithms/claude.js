export class TFIDF {
    calculate(agg) {
      const organScoreValues = Object.values(agg.organScores).sort((a, b) => b - a);
      const avgScore = agg.allScores.reduce((sum, score) => sum + score, 0) / agg.allScores.length;
      let variance = 0;
      const topOrganScores = organScoreValues.slice(0, Math.min(3, organScoreValues.length));
      const topScoresAvg = topOrganScores.reduce((sum, score) => sum + score, 0) / topOrganScores.length;
      if (topOrganScores.length > 1) {
        variance = topOrganScores.reduce((sum, score) => sum + Math.pow(score - topScoresAvg, 2), 0) / topOrganScores.length;
      }
      let finalScore;
      if (topOrganScores.length >= 2 && variance < 0.05 && topScoresAvg > 0.7) {
        finalScore = topScoresAvg * Math.sqrt(topOrganScores.length) * (1 + Math.log(agg.matching_organs.size));
      } else {
        const organDiversity = agg.matching_organs.size / Math.max(1, agg.matchCount);
        const matchCountFactor = Math.log(agg.matchCount + 1) * 0.4;
        finalScore = avgScore * (1 + matchCountFactor) * (1 + organDiversity * 0.5);
      }

      return {finalScore, avgScore}
    }
}

export class Intelligent {
    calculate(agg) {
      const organScoreValues = Object.values(agg.organScores).sort((a, b) => b - a);
      const topOrganScores = organScoreValues.slice(0, Math.min(3, organScoreValues.length));
      
      // Calculate the average of all scores and top scores
      const avgScore = agg.allScores.reduce((sum, score) => sum + score, 0) / agg.allScores.length;
      const topScoresAvg = topOrganScores.reduce((sum, score) => sum + score, 0) / topOrganScores.length;
      
      // Calculate metrics for scoring
      const organDiversity = agg.matching_organs.size;
      const sourceDiversity = agg.sources.size;
      const matchCount = agg.matchCount;
      
      // Unified scoring formula with balanced weights
      const similarityWeight = 0.6;
      const diversityWeight = 0.25;
      const countWeight = 0.15;
      
      // Compute the final score using a weighted approach
      const finalScore = (
        similarityWeight * topScoresAvg + 
        diversityWeight * (organDiversity / Math.max(1, matchCount)) +
        countWeight * Math.log(matchCount + 1)
      );

      return {finalScore, avgScore}
    }
}