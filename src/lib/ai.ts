import { GoogleGenerativeAI } from '@google/generative-ai';

// We will store the API key in localStorage for basic frontend persistence
export const getApiKey = () => localStorage.getItem('gemini_api_key') || '';

export const setApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
};

export const hasApiKey = () => !!getApiKey();

// Initialize the API
export const getGenAI = () => {
    const key = getApiKey();
    if (!key) throw new Error('API key not found');
    return new GoogleGenerativeAI(key);
};

export const getAIResponse = async (prompt: string, context?: string): Promise<string> => {
    if (!hasApiKey()) {
        return "Please set your Gemini API key in the settings first.";
    }

    try {
        const genAI = getGenAI();
        // Use the new gemini-2.5-flash model as supported by the user's API key
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const fullPrompt = context
            ? `Context regarding the user's notes and application state:\n${context}\n\nUser Question: ${prompt}`
            : prompt;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("AI Error:", error);
        return `Connection Error: ${error?.message || "Unknown error"}. Please check your API key and try again.`;
    }
};

export const generateAIFlashcards = async (pdfUrl: string): Promise<{ question: string, answer: string }[]> => {
    if (!hasApiKey()) {
        throw new Error("Please set your Gemini API key in the settings first.");
    }

    try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();

        const base64data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve(base64String.split(',')[1]);
            };
            reader.onerror = reject;
        });

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = "Analyze this document and extract 3 to 5 key flashcards for high-speed studying. Output ONLY a raw JSON array of objects with 'question' and 'answer' string keys. Be concise and fast. No markdown. No prefixes.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64data,
                    mimeType: "application/pdf"
                }
            }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error(" cant generate flash card");
        }

        const flashcards = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(flashcards) || flashcards.length === 0) {
            throw new Error("cant generate flash card");
        }
        return flashcards;
    } catch (error: any) {
        console.error("Flashcard generation error:", error);
        if (error.message.includes("cant generate flash card")) {
            throw new Error("cant generate flash card");
        }
        throw new Error(error.message || "cant generate flash card");
    }
};

export const analyzePDFForVideos = async (pdfUrl: string): Promise<{ title: string, url: string }[]> => {
    if (!hasApiKey()) {
        throw new Error("Please set your Gemini API key in the settings first.");
    }

    try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();

        const base64data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve(base64String.split(',')[1]);
            };
            reader.onerror = reject;
        });

        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = "Analyze this syllabus or study document and identify 3 to 5 core lecture topics. For each topic, create a highly specific YouTube search URL that a student would use to find the best, most-viewed lecture videos on that exact topic (e.g. 'https://www.youtube.com/results?search_query=machine+learning+stanford+lecture'). Return ONLY a valid JSON array of objects, where each object has a 'title' (a clean, human-readable title of the topic) and a 'url' (the youtube search URL). Sort them by fundamental importance. No markdown, no explanations.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64data,
                    mimeType: "application/pdf"
                }
            }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error("Could not parse AI video recommendation response");
        }

        const videos = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(videos) || videos.length === 0) {
            throw new Error("Could not extract topics for videos");
        }
        return videos;
    } catch (error: any) {
        console.error("Video recommendation error:", error);
        throw new Error(error.message || "Failed to analyze document for videos");
    }
};
