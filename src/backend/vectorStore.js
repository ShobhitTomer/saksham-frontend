// Note: Using dynamic import() for @xenova/transformers
const crimeData = require("../data/data.json"); // Use require for JSON
const { convertExcelDate, formatDate } = require("./dateUtils"); // Import date utilities

// Regex to potentially identify FIR numbers (Adjusted to 14 or more digits)
const firRegex = /(\d{14,})/;

// Define CrimeReport structure (optional, mainly for reference)
/*
interface CrimeReport {
  "Sr no": number; ...etc
}
*/

// Define VectorRecord structure (optional, mainly for reference)
/*
interface VectorRecord {
  id: string; text: string; embedding: number[]; metadata: CrimeReport;
}
*/

// --- Simple Cosine Similarity ---
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
// --- ---

class InMemoryVectorStore {
  constructor() {
    this.extractor = null;
    this.store = [];
    this.isInitialized = false;
    this.modelName = "Xenova/all-MiniLM-L6-v2";
    this.transformers = null; // To store the dynamically imported library
  }

  async initialize() {
    if (this.isInitialized) return;
    console.log("Initializing vector store...");

    // Dynamically import the transformers library
    if (!this.transformers) {
      this.transformers = await import("@xenova/transformers");
    }
    const { pipeline } = this.transformers; // Destructure after import

    // Load the embedding model
    this.extractor = await pipeline("feature-extraction", this.modelName);
    console.log("Embedding model loaded.");

    // Load and process data
    const data = crimeData; // No casting needed
    console.log(`Processing ${data.length} records...`);

    for (const record of data) {
      // --- Convert and Format Date ---
      const jsDate = convertExcelDate(record.case_date);
      const formattedDate = formatDate(jsDate);
      // --- ---

      // --- Update textToEmbed with formatted date ---
      const textToEmbed = `FIR ${record.fir_no}: Crime of ${record["Crime Head"]} (${record.Category}) occurred in ${record["District/City"]} on ${formattedDate} involving ${record.first_name} ${record.last_name}. Motive: ${record.motive_of_crime}. Detected: ${record["IS_DETECTED (Yes/No)"]}.`;
      // --- ---

      if (!this.extractor) throw new Error("Extractor not initialized");

      const output = await this.extractor(textToEmbed, {
        pooling: "mean",
        normalize: true,
      });
      const embedding = Array.from(output.data); // No Float32Array cast needed

      this.store.push({
        id: record.fir_no,
        text: textToEmbed,
        embedding: embedding,
        metadata: record,
      });
    }

    this.isInitialized = true;
    console.log(`Vector store initialized with ${this.store.length} records.`);
  }

  // --- Updated Search Method ---
  async search(query, topK = 3) {
    if (!this.isInitialized || !this.extractor) {
      throw new Error("Vector store not initialized.");
    }

    console.log(`Searching for query: "${query}"`);

    // 1. Check for explicit FIR match in the query string
    const firMatch = query.match(firRegex); // Uses the updated regex
    if (firMatch && firMatch[0]) {
      const firNumber = firMatch[0];
      console.log(`Attempting direct lookup for FIR: ${firNumber}`);
      // Find the record directly by FIR number in the metadata
      const foundRecord = this.store.find(
        (record) => record.metadata.fir_no === firNumber
      );
      if (foundRecord) {
        console.log(`Direct FIR match found.`);
        // If found, return only this record's metadata
        return [foundRecord.metadata];
      } else {
        console.log(`Direct FIR lookup failed for ${firNumber}.`);
        // If specific FIR mentioned but not found, return empty array
        return [];
      }
    }

    // 2. If no FIR match, proceed with semantic vector search
    console.log(`No specific FIR detected, performing vector search.`);
    const queryOutput = await this.extractor(query, {
      pooling: "mean",
      normalize: true,
    });
    const queryEmbedding = Array.from(queryOutput.data);

    const similarities = this.store.map((record) => ({
      metadata: record.metadata,
      similarity: cosineSimilarity(queryEmbedding, record.embedding),
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    const topResults = similarities
      .slice(0, topK)
      .map((result) => result.metadata);
    console.log(`Vector search found ${topResults.length} relevant results.`);
    return topResults;
  }
  // --- ---
}

// Export a singleton instance using module.exports
const vectorStoreInstance = new InMemoryVectorStore();
// Also export the regex if needed in routes.js
module.exports = { vectorStore: vectorStoreInstance, firRegex };
