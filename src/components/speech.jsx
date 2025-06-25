import React, { useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Dictaphone = ({ setCode }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
 

  const wasListening = useRef(false);

  // Detect when microphone turns OFF
  useEffect(() => {
    if (wasListening.current && !listening && transcript.trim() !== "") {

      

      setCode((prev) => prev + `\n// Voice: ${transcript}`);

        resetTranscript(); // Optionally reset after appending
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

        {/* <button
          className="px-3 py-1 rounded bg-yellow-500 text-black"
          onClick={resetTranscript}
        >
          Reset
        </button> */}
      </div>
    </div>
  );
};

export default Dictaphone;

