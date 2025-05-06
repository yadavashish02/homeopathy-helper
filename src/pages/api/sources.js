import { SOLUTIONS_COLLECTION } from "@/lib/config";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    try {
      const sourceList = Object.keys(SOLUTIONS_COLLECTION).filter(source => source && typeof source === 'string').map(source => source.toLowerCase());
  
      res.status(200).json(sourceList.sort()); // Return sorted list
  
    } catch (error) {
      console.error('API error getting sources:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }