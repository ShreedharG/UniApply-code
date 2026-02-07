import model from "../config/gemini.js";

/**
 * Processes the raw text using Google Gemini to extract structured Academic Record data.
 * @param {string} rawText - The full text content of the document.
 * @returns {Promise<Object>} Structured JSON data.
 */
export const processWithLLM = async (rawText) => {
  try {
    const prompt = `
        You are an AI specialized in analyzing Academic Marksheets.
        Your task is to extract structured data from the following document text and return it in Strict JSON format.

        Document Text:
        """
        ${rawText}
        """

        Requirements:
        1. **Strict JSON Only**: Do not include markdown code blocks (\`\`\`json). Return raw JSON.
        2. **Unknown Fields**: If a field is not found, use \`null\`.
        3. **No Inferences**: Do not guess marks or data. Only extract what is visible.
        4. **Subjects**: 
           - Extract ALL scholastic subjects found in tables.
           - Ignore "Work Experience", "Health", "General Studies".
           - Extract \`theoryMarks\`, \`practicalMarks\`, and \`totalMarks\`. 
        5. **Classification**:
           - Identify \`board\` (CBSE, ICSE, etc.).
           - Identify \`examType\` ("10TH" or "12TH") based on keywords like "Secondary" vs "Senior School".
           - Identify \`result\` (PASS/FAIL).

        Output Schema:
        {
          "board": string | null,
          "examType": "10TH" | "12TH" | null,
          "studentName": string | null,
          "rollNumber": string | null,
          "school": string | null,
          "subjects": [
            {
              "subject": string,
              "theoryMarks": number | null,
              "practicalMarks": number | null,
              "totalMarks": number | null
            }
          ],
          "additionalSubjects": [
            {
              "subject": string,
              "totalMarks": number | null
            }
          ],
          "result": "PASS" | "FAIL" | null
        }
        `;

    const response = await model.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    // Response structure in new SDK might be different, but README says response.text
    let text = response.text;
    if (!text) {
      // Fallback if text property is different (sometimes it is a function in other SDKs, 
      // but README line 70 says console.log(response.text))
      text = JSON.stringify(response);
    }

    // Cleanup markdown if present (just in case)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("LLM Processing Failed:", error);
    throw new Error(`LLM Extraction failed: ${error.message}`);
  }
};
