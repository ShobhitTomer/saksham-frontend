const { Router } = require("express");
const { Ollama } = require("ollama");
const { vectorStore, firRegex } = require("./vectorStore");
const { convertExcelDate, formatDate } = require("./dateUtils");
const crimeData = require("../data/data.json"); // Import raw data for counting

const router = Router();
const ollama = new Ollama({ host: "http://localhost:11434" });

// Updated System Prompt to handle counting and listing
const systemPromptContent = `You are an expert AI assistant specializing in Indian Law, policing procedures, and analyzing crime data based on provided context.
The crime report data structure includes fields like: "Sr no", "District/City", "loc_name", "fir_no", "case_date", "Villlage", "Taluka", "Occurence District", "Occurence City", "latitude", "longitude", "first_name", "middle_name", "last_name", "age", "Gender", "motive_of_crime", "IS_DETECTED (Yes/No)", "Crime Head", "Category".

IMPORTANT INSTRUCTIONS:
1. Prioritize answering questions based on the provided CONTEXT data if it exists.
2. If CONTEXT provides a specific count (e.g., "COUNT_RESULT: X incidents found..."), state that count clearly.
3. If CONTEXT provides a list of incidents (e.g., "LIST_RESULT: Showing first Y of Z incidents..."): Present the list clearly. State that it's a partial list showing the first Y incidents out of the total Z found. Do not hallucinate details for records not provided.
4. If CONTEXT provides specific FIR details: Use ONLY that data. Pay close attention to 'case_date' (YYYY-MM-DD format) and 'fir_no'. Quote the date exactly if asked.
5. If CONTEXT states 'No specific data found...': Inform the user clearly.
6. If NO CONTEXT is provided: Answer questions about general Indian Law or policing procedures based on your internal knowledge.
7. Decline to answer questions completely unrelated to Indian Law, policing, or the crime data structure.`;

// --- Helper Function to Extract Criteria and Count ---
function performCount(query) {
  const lowerQuery = query.toLowerCase();
  let count = 0;
  let criteria = null;

  // Simple check for counting intent and location (extendable)
  const countMatch = lowerQuery.match(/how many|count/);
  const locationMatch = lowerQuery.match(/(?:in|at|for)\s+([a-z\s]+)(?:\?|$)/); // Basic location extraction

  if (countMatch && locationMatch && locationMatch[1]) {
    criteria = locationMatch[1].trim();
    console.log(`Counting intent detected for criteria: "${criteria}"`);
    // Perform count on raw data (case-insensitive)
    count = crimeData.filter(
      (item) =>
        item["District/City"]?.toLowerCase() === criteria ||
        item["Occurence District"]?.toLowerCase() === criteria ||
        item["Occurence City"]?.toLowerCase() === criteria ||
        item["Taluka"]?.toLowerCase() === criteria ||
        item["Villlage"]?.toLowerCase() === criteria
    ).length;
    console.log(`Count result: ${count}`);
    return { criteria, count };
  }
  return null; // Not a recognized counting query
}

// --- Helper Function to Extract Criteria and List (Subset) ---
function performListAll(query, maxList = 10) {
  const lowerQuery = query.toLowerCase();
  let criteria = null;
  let results = [];

  // Simple check for listing intent and location (extendable)
  const listMatch = lowerQuery.match(
    /list all|list the|list incidents|show all|show the/
  );
  // Try to extract location criteria similar to performCount
  const locationMatch = lowerQuery.match(/(?:in|at|for)\s+([a-z\s]+)(?:\?|$)/);

  if (listMatch && locationMatch && locationMatch[1]) {
    criteria = locationMatch[1].trim();
    console.log(`Listing intent detected for criteria: "${criteria}"`);
    // Filter the raw data
    results = crimeData.filter(
      (item) =>
        item["District/City"]?.toLowerCase() === criteria ||
        item["Occurence District"]?.toLowerCase() === criteria ||
        item["Occurence City"]?.toLowerCase() === criteria ||
        item["Taluka"]?.toLowerCase() === criteria ||
        item["Villlage"]?.toLowerCase() === criteria
    );
    const totalFound = results.length;
    console.log(`Found ${totalFound} total matches for listing.`);
    // Return only a subset
    const subset = results.slice(0, maxList);
    return { criteria, subset, totalFound };
  }
  return null; // Not a recognized listing query
}
// --- ---

router.post("/api/chat", async (req, res) => {
  const { messages: history } = req.body;

  if (!history || history.length === 0) {
    return res.status(400).json({ error: "Message history is required." });
  }

  const currentUserMessage = history[history.length - 1];
  if (currentUserMessage.role !== "user") {
    return res.status(400).json({ error: "Last message must be from user." });
  }

  try {
    let contextMessage = null;
    let relevantData = []; // Initialize relevantData

    // --- Check for Counting Intent First ---
    const countResult = performCount(currentUserMessage.content);

    // --- Check for Listing Intent Second ---
    const listResult = !countResult
      ? performListAll(currentUserMessage.content)
      : null; // Only check if not a count query

    if (countResult !== null) {
      // Handle Count Query
      contextMessage = {
        role: "system",
        content: `COUNT_RESULT: ${countResult.count} incidents found matching criteria '${countResult.criteria}' in the dataset.`,
      };
    } else if (listResult !== null) {
      // Handle List Query
      if (listResult.subset.length > 0) {
        const formattedSubset = listResult.subset.map((item) => {
          const jsDate = convertExcelDate(item.case_date);
          return { ...item, case_date: formatDate(jsDate) };
        });
        const contextString = formattedSubset
          .map((item) => JSON.stringify(item))
          .join("\n---\n");
        contextMessage = {
          role: "system",
          content: `LIST_RESULT: Showing first ${listResult.subset.length} of ${listResult.totalFound} incidents found matching criteria '${listResult.criteria}'.\n${contextString}\n\nPresent this list clearly and state it's a partial list.`,
        };
      } else {
        contextMessage = {
          role: "system",
          content: `CONTEXT: No incidents found matching the listing criteria '${listResult.criteria}'.`,
        };
      }
    } else {
      // --- If not Count or List, proceed with standard RAG ---
      const firMatch = currentUserMessage.content.match(firRegex);
      const isFirQuery = !!firMatch;

      relevantData = await vectorStore.search(currentUserMessage.content); // Standard search

      if (relevantData.length > 0) {
        const formattedRelevantData = relevantData.map((item) => {
          const jsDate = convertExcelDate(item.case_date);
          return { ...item, case_date: formatDate(jsDate) };
        });
        const contextString = formattedRelevantData
          .map((item) => JSON.stringify(item))
          .join("\n---\n");
        const contextHeader =
          isFirQuery && relevantData.length === 1
            ? `CONTEXT for FIR ${relevantData[0].fir_no}:`
            : `CONTEXT potentially relevant to the preceding user query:`;
        contextMessage = {
          role: "system",
          content: `${contextHeader}\n${contextString}\n\nUse this data ONLY to answer the query. Pay close attention to the 'case_date'. Synthesize if multiple entries are relevant.`,
        };
      } else if (isFirQuery) {
        contextMessage = {
          role: "system",
          content: `CONTEXT: No specific data found for FIR ${firMatch[0]} in the dataset. Inform the user clearly.`,
        };
      }
      // --- End Standard RAG ---
    }

    // Construct messages for Ollama
    const messagesForApi = [
      { role: "system", content: systemPromptContent }, // Use updated prompt
      ...history.slice(0, -1).filter((m) => m.role !== "system"),
      currentUserMessage,
    ];
    if (contextMessage) {
      messagesForApi.push(contextMessage);
    }

    const responseStream = await ollama.chat({
      model: "gemma3:4b",
      messages: messagesForApi,
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // --- Stream Processing with <think> tag filtering ---
    let isThinking = false; // State to track if inside <think> tags
    let buffer = ""; // Buffer to handle tags spanning multiple chunks

    for await (const part of responseStream) {
      buffer += part.message?.content || ""; // Append new content to buffer

      let outputChunk = ""; // Content to be sent in this iteration

      while (buffer.length > 0) {
        if (isThinking) {
          const endTagIndex = buffer.indexOf("</think>");
          if (endTagIndex !== -1) {
            // Found the end tag, discard content up to and including the tag
            buffer = buffer.substring(endTagIndex + "</think>".length);
            isThinking = false; // Exited thinking block
          } else {
            // End tag not found in current buffer, discard the whole buffer (it's all thinking)
            buffer = "";
          }
        } else {
          const startTagIndex = buffer.indexOf("<think>");
          if (startTagIndex !== -1) {
            // Found a start tag
            // Append content before the tag to the output
            outputChunk += buffer.substring(0, startTagIndex);
            // Update buffer to start after the tag
            buffer = buffer.substring(startTagIndex + "<think>".length);
            isThinking = true; // Entered thinking block
          } else {
            // No start tag found, the entire buffer is valid content (for now)
            outputChunk += buffer;
            buffer = ""; // Clear buffer as it's processed
          }
        }
      }

      // Send the processed (non-thinking) chunk if it's not empty
      if (outputChunk.length > 0) {
        // Re-wrap the filtered content in the original stream structure
        const filteredPart = {
          ...part, // Keep other properties like model, created_at, done
          message: {
            ...part.message,
            content: outputChunk,
          },
        };
        res.write(`data: ${JSON.stringify(filteredPart)}\n\n`);
      }
      // Check if the original part indicated the stream is done
      if (part.done) {
        break; // Exit loop if Ollama signals completion
      }
    }
    // --- End Stream Processing ---

    res.end();
  } catch (error) {
    console.error("Error in /api/chat:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to process chat request.",
        details: error.message,
      });
    } else {
      res.end();
    }
  }
});

module.exports = router;
