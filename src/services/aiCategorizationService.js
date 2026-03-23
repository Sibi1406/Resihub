import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Categories that the AI can assign to a complaint.
 */
export const COMPLAINT_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Security",
  "Maintenance",
  "Housekeeping",
  "Noise",
  "Parking",
  "Internet",
  "Other",
];

/**
 * Use Gemini to classify a complaint into one of the fixed categories.
 * Returns one of COMPLAINT_CATEGORIES. Falls back to "Other" on any error.
 */
export async function classifyComplaint(title = "", description = "") {
  try {
    const prompt = `You are an expert property management assistant.
Classify the following resident complaint into EXACTLY ONE of these categories:
${COMPLAINT_CATEGORIES.join(" | ")}

Complaint Title: "${title}"
Complaint Description: "${description}"

Reply with only the category name, nothing else.`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    // Validate it's one of our known categories (case-insensitive)
    const match = COMPLAINT_CATEGORIES.find(
      (c) => c.toLowerCase() === raw.toLowerCase()
    );
    return match ?? "Other";
  } catch (err) {
    console.error("[AI Categorization] Failed:", err);
    return "Other";
  }
}
