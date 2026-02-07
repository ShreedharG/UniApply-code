import { ListBucketsCommand } from "@aws-sdk/client-s3";
import { AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import s3 from "../config/s3Client.js";
import textract from "../config/textractClient.js";
import genAI from "../config/gemini.js";

export const verifyExternalServices = async () => {
    console.log("-----------------------------------------");
    console.log("🔌 Verifying External Services...");
    console.log("-----------------------------------------");

    const checks = [
        checkS3(),
        checkTextract(),
        checkGemini()
    ];

    await Promise.allSettled(checks);
    console.log("-----------------------------------------");
};

const checkS3 = async () => {
    try {
        await s3.send(new ListBucketsCommand({}));
        console.log("✅ AWS S3: Connected");
    } catch (error) {
        console.error(`❌ AWS S3: Connection Failed (${error.message})`);
    }
};

const checkTextract = async () => {
    try {
        // 1x1 Transparent GIF
        const dummyBuffer = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
        const command = new AnalyzeDocumentCommand({
            Document: { Bytes: dummyBuffer },
            FeatureTypes: ["TABLES"]
        });

        await textract.send(command);
        console.log("✅ AWS Textract: Connected");
    } catch (error) {
        // "UnsupportedDocumentException" means Auth worked but image failed (which is good for connectivity check)
        // "InvalidParameterException" or similar might also occur.
        if (error.name === "UnsupportedDocumentException" || error.name === "InvalidParameterException" || error.message.includes("format")) {
            console.log("✅ AWS Textract: Connected");
        } else {
            console.error(`❌ AWS Textract: Connection Failed (${error.message})`);
        }
    }
};

const checkGemini = async () => {
    try {
        // Use countTokens as a lightweight check for Auth & Model existence without generating full content
        // Using 'gemini-2.0-flash' as confirmed working
        await genAI.models.countTokens({
            model: "gemini-2.5-flash",
            contents: "Test connection"
        });
        console.log("✅ Google Gemini: Connected");
    } catch (error) {
        if (error.status === 429 || error.message.includes("quota")) {
            console.log("⚠️  Google Gemini: Connected (Quota Exceeded)");
        } else {
            // Try to extract a clean message
            let cleanMsg = error.message;
            if (error.errorDetails && error.errorDetails.length > 0) {
                cleanMsg = error.errorDetails[0].message || cleanMsg;
            } else if (error.stack && error.stack.includes("API key expired")) {
                cleanMsg = "API Key Expired";
            } else {
                // Regex to find "message": "..." in schema
                const match = error.message.match(/"message":\s*"([^"]+)"/);
                if (match) cleanMsg = match[1];
            }

            console.error(`❌ Google Gemini: Connection Failed (${cleanMsg})`);
        }
    }
};
