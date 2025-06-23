import { debounce } from "lodash";
import axios from "axios";

const fetchSuggestions = async (partialCode) => {
  try {
    const prompt = `Suggest a continuation or improvements for this code:\n${partialCode}\n\n// Suggestion:\n`;

    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer YOUR_OPENAI_API_KEY`,
        },
      }
    );

    const suggestion = res.data.choices[0].message.content;
    setSuggestion(suggestion); // update suggestion box or hint
  } catch (err) {
    console.error("AI Suggestion Error:", err);
  }
};

const debounceFetchSuggestions = debounce(fetchSuggestions, 2000);
