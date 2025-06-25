
import React, { useEffect, useRef } from "react";
import axios from "axios";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
const apiKey = import.meta.env.VITE_OPENROUTER_KEY;

const Dictaphone = ({ setCode }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const wasListening = useRef(false);


  // Convert transcript to code using OpenRouter API
  const convertSpeechToCode = async (spokenText) => {
    try {
      const prompt = `Convert the following text  into code with correct syntax do as ask return only code if you get nothing related to code return send only code description and do not sent output as it is using in code edtior as feature do what is asking for only (no explanation, just code):\n"${spokenText}"`;

      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "thudm/glm-4-32b:free", // free model
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173", // Optional
            "X-Title": "VoiceToCode Editor",
          },
        }
      );

      const aiCode = res.data.choices[0].message.content.trim();
      setCode((prev) => prev + "\n" + aiCode);
    } catch (err) {
      console.error("AI conversion failed:", err?.response?.data || err.message);
    }
  };

  // Handle when microphone turns off
  useEffect(() => {
    if (wasListening.current && !listening && transcript.trim() !== "") {
      convertSpeechToCode(transcript); // Convert and insert code
      resetTranscript();
    }
    wasListening.current = listening;
  }, [listening, transcript, setCode, resetTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return <p>❌ Browser doesn't support speech recognition.</p>;
  }

  return (
    <div className="space-y-2">
      <p>🎙️ Microphone: {listening ? "On" : "Off"}</p>

      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded bg-green-500 text-white"
          onClick={() =>
            SpeechRecognition.startListening({ continuous: true })
          }
        >
          Start Speaking
        </button>

        <button
          className="px-3 py-1 rounded bg-red-500 text-white"
          onClick={SpeechRecognition.stopListening}
        >
          Stop
        </button>

        <button
          className="px-3 py-1 rounded bg-yellow-500 text-black"
          onClick={resetTranscript}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Dictaphone;

