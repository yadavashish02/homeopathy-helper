import { SOLUTIONS_COLLECTION } from '@/lib/config';
import { connectToDb } from '@/lib/mongodb';

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Missing "id" parameter in URL' });
  }

  try {
    const { db } = await connectToDb();
    const collection = db.collection(SOLUTIONS_COLLECTION.CLARKE);
    const solutionDoc = await collection.findOne({_id: id});

    if (!solutionDoc) {
      return res.status(404).json({ error: 'Solution not found' });
    }

    // Build response
    const result = {
      description: solutionDoc.description || null,
      characteristics: solutionDoc.characteristics || null,
      relations: solutionDoc.relations || null,
      symptoms: solutionDoc.symptoms || null,
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Solution API error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
