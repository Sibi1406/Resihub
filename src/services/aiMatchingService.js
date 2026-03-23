import { GoogleGenerativeAI } from "@google/generative-ai";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Use Gemini to find the best match for a newly reported item
 * against a list of existing items of the opposite type.
 *
 * @param {Object} newItem — the item just reported
 * @param {Array}  candidates — existing items of the opposite type (lost↔found)
 * @returns {Array} scored list: [{id, score, reason}] sorted by score desc
 */
export async function findAIMatches(newItem, candidates) {
    if (!candidates || candidates.length === 0) return [];

    try {
        const candidateText = candidates
            .map((c, i) => `${i + 1}. [ID:${c.id}] "${c.itemName}" — ${c.description}`)
            .join("\n");

        const prompt = `You are a lost & found matching assistant for a residential community.

A resident just reported:
Type: ${newItem.type === "lost" ? "LOST" : "FOUND"}
Item: "${newItem.itemName}"
Description: "${newItem.description}"

Here are existing ${newItem.type === "lost" ? "FOUND" : "LOST"} items in the system:
${candidateText}

For each candidate, rate the match likelihood from 0.0 to 1.0 based on item name and description similarity.
Only include candidates with score >= 0.4.

Reply ONLY with a JSON array (no markdown, no explanation):
[{"id":"<exact ID>","score":<0.0-1.0>,"reason":"<one short sentence>"}]

If no good matches, reply with an empty array: []`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        // Strip markdown code fences if present
        text = text.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "").trim();
        const matches = JSON.parse(text);
        return Array.isArray(matches)
            ? matches.sort((a, b) => b.score - a.score)
            : [];
    } catch (err) {
        console.error("[AI Matching] Failed:", err);
        return [];
    }
}

/**
 * Save AI match suggestions back to Firestore on the newItem doc.
 */
export async function saveAISuggestions(itemId, matches) {
    if (!matches || matches.length === 0) return;
    return updateDoc(doc(db, "lostFound", itemId), {
        aiMatchSuggestion: matches[0]?.id ?? null,
        aiMatchScore: matches[0]?.score ?? null,
        aiMatchReason: matches[0]?.reason ?? null,
    });
}
