import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Google Gen AI SDK (New V2+ SDK)
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default genAI;
