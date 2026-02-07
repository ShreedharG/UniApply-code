import AcademicRecord from "../models/AcademicRecord.js";
import { fetchDocumentFromS3, analyzeDocument, extractRawText } from "./ocrService.js";
import { processWithLLM } from "./llmService.js";

/**
 * Orchestrates the full document processing pipeline.
 * @param {string} academicRecordId - ID of the record to process.
 */
export const processAcademicRecord = async (academicRecordId) => {
    try {
        const record = await AcademicRecord.findById(academicRecordId);
        if (!record) throw new Error("Record not found");

        record.processingStatus = "PROCESSING";
        await record.save();

        console.log(`Processing record ${academicRecordId} | URL: ${record.documentUrl}`);

        // 1. Fetch
        const fileBuffer = await fetchDocumentFromS3(record.documentUrl);

        // 2. Analyze (Textract) - STILL REQUIRED for tables context if we want to pass tables to LLM
        // However, extracting raw text from Textract is better than just OCR if we have it.
        // For now, we pass the Textract blocks flattened.
        const textractResponse = await analyzeDocument(fileBuffer);
        const rawText = extractRawText(textractResponse);

        // 3. LLM Extraction (Gemini)
        const parsedData = await processWithLLM(rawText);

        // 4. Update Record
        const aiData = {
            confidenceScore: 95, // Gemini doesn't give a score easily, assuming high for now or logic needed
            extractedSubjects: parsedData.subjects,
            rawText: rawText,
            detectedBoard: parsedData.board,
            llmObject: parsedData // Save the clean JSON
        };

        await record.processAIResult(aiData);

        // Explicitly save the other fields 
        record.board = parsedData.board || record.board;
        // record.rollNumber = parsedData.rollNumber; // If schema allows

        record.processingStatus = "COMPLETED";
        await record.save();

        return { success: true, data: parsedData };

    } catch (error) {
        console.error(`Processing failed for record ${academicRecordId}:`, error);

        // Update status to FAILED
        try {
            await AcademicRecord.findByIdAndUpdate(academicRecordId, {
                processingStatus: "FAILED",
                "aiScoreVerification.status": "FAIL",
                "aiScoreVerification.flags": [error.message]
            });
        } catch (dbError) {
            console.error("Failed to update error status:", dbError);
        }

        return { success: false, error: error.message };
    }
};
