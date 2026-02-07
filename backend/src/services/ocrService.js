import s3 from "../config/s3Client.js";
import textract from "../config/textractClient.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { AnalyzeDocumentCommand } from "@aws-sdk/client-textract";

/**
 * Fetches a document from S3 and returns it as a Buffer (Uint8Array).
 * @param {string} key - The S3 object key (or full URL if handled).
 * @returns {Promise<Uint8Array>}
 */
export const fetchDocumentFromS3 = async (key) => {
    try {
        // Handle full URL if passed, assuming standard S3 URL format
        // This is a basic extraction, might need robustness
        let s3Key = key;
        if (key.startsWith("http")) {
            const url = new URL(key);
            s3Key = url.pathname.substring(1); // Remove leading slash
        }

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
        });

        const response = await s3.send(command);

        // Convert stream to buffer
        const streamToBuffer = (stream) =>
            new Promise((resolve, reject) => {
                const chunks = [];
                stream.on("data", (chunk) => chunks.push(chunk));
                stream.on("error", reject);
                stream.on("end", () => resolve(Buffer.concat(chunks)));
            });

        return await streamToBuffer(response.Body);
    } catch (error) {
        console.error("Error fetching from S3:", error);
        throw new Error(`Failed to fetch document from S3: ${error.message}`);
    }
};

/**
 * Sends a document buffer to Amazon Textract for analysis.
 * @param {Uint8Array} documentBuffer
 * @returns {Promise<Object>} Textract response
 */
export const analyzeDocument = async (documentBuffer) => {
    try {
        const command = new AnalyzeDocumentCommand({
            Document: {
                Bytes: documentBuffer,
            },
            FeatureTypes: ["TABLES", "FORMS"],
        });

        const response = await textract.send(command);
        return response;
    } catch (error) {
        console.error("Error analyzing document with Textract:", error);
        throw new Error(`Textract analysis failed: ${error.message}`);
    }
};

/**
 * Helper to extract meaningful text from Textract response for LLM context.
 * @param {Object} textractResponse 
 * @returns {string} Flattened text representation
 */
export const extractRawText = (textractResponse) => {
    if (!textractResponse.Blocks) return "";

    // We prioritize LINEs to give the LLM the reading order
    return textractResponse.Blocks
        .filter(block => block.BlockType === "LINE")
        .map(block => block.Text)
        .join("\n");
};


