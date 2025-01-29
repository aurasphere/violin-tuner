import { YIN } from "pitchfinder";
import { useEffect, useRef, useState } from "react";
import "./app.css";

const notes = [
  {
    string: "G3",
    note: "G3",
    name_italian: "Sol",
    frequency: 196,
  },
  {
    string: "G3",
    note: "A3",
    name_italian: "La",
    frequency: 220,
  },
  {
    string: "G3",
    note: "B3",
    name_italian: "Si",
    frequency: 246.94,
  },
  {
    string: "G3",
    note: "C4",
    name_italian: "Do",
    frequency: 261.63,
  },
  {
    string: "D4",
    note: "D4",
    name_italian: "Re",
    frequency: 293.66,
  },
  {
    string: "D4",
    note: "E4",
    name_italian: "Mi",
    frequency: 329.63,
  },
  {
    string: "D4",
    note: "F#4",
    name_italian: "Fa#",
    frequency: 369.99,
  },
  {
    string: "D4",
    note: "G4",
    name_italian: "Sol",
    frequency: 392,
  },
  {
    string: "A4",
    note: "A4",
    name_italian: "La",
    frequency: 440,
  },
  {
    string: "A4",
    note: "B4",
    name_italian: "Si",
    frequency: 493.88,
  },
  {
    string: "A4",
    note: "C#5",
    name_italian: "Do#",
    frequency: 554.37,
  },
  {
    string: "A4",
    note: "D5",
    name_italian: "Re",
    frequency: 587.33,
  },
  {
    string: "E5",
    note: "E5",
    name_italian: "Mi",
    frequency: 659.26,
  },
  {
    string: "E5",
    note: "F#5",
    name_italian: "Fa#",
    frequency: 739.99,
  },
  {
    string: "E5",
    note: "G#5",
    name_italian: "Sol#",
    frequency: 830.61,
  },
  {
    string: "E5",
    note: "A5",
    name_italian: "La",
    frequency: 880,
  },
  {
    string: "E5",
    note: "B5",
    name_italian: "Si",
    frequency: 987.77,
  },
];

export default function App() {
  const [currentNote, setCurrentNote] = useState(0);
  const [difference, setDifference] = useState(0);
  const [pitch, setPitch] = useState(0);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);

  // Detect pitch
  const detectPitch = new YIN();
  const startMicrophone = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: false,
        echoCancellation: false,
        autoGainControl: false,
      },
    });
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    const biquadFilter = audioContext.createBiquadFilter();
    biquadFilter.type = "lowpass";
    biquadFilter.frequency.value = 1000;
    source.connect(biquadFilter).connect(analyser);
    analyserRef.current = analyser;
    audioContextRef.current = audioContext;
  };

  const checkIfInTune = async () => {
    if (!analyserRef.current) return;

    const buffer = new Float32Array(2048);
    analyserRef.current.getFloatTimeDomainData(buffer);

    // Detect pitch
    // Slight adjustment in pitch detection
    const detectedPitch = detectPitch(buffer) * 1.09;
    if (detectedPitch && detectedPitch > 20 && detectedPitch < 5000) {
      setPitch(detectedPitch);
      const closestNoteIndex = notes.findIndex(
        (note) =>
          Math.abs(note.frequency - detectedPitch) ===
          Math.min(...notes.map((n) => Math.abs(n.frequency - detectedPitch)))
      );

      setCurrentNote(closestNoteIndex);
      setDifference(detectedPitch - notes[closestNoteIndex].frequency);
    }
  };

  useEffect(() => {
    startMicrophone();
    const interval = setInterval(checkIfInTune, 300);
    return () => {
      clearInterval(interval);
      audioContextRef?.current?.close();
    };
  }, []);

  const backgroundColor = Math.abs(difference) > 2 ? "bg-red" : "bg-green";
  return (
    <div className={`app-container ${backgroundColor}`}>
      <h1 className="title">
        {notes[currentNote].note} ({notes[currentNote].name_italian}){" "}
        {pitch?.toFixed(2)} Hz
      </h1>
      <h2
        className={`subtitle difference ${
          difference > 0 ? "text-red" : "text-green"
        }`}
      >
        {difference > 0
          ? `+${difference.toFixed(2)} Hz`
          : `${difference.toFixed(2)} Hz`}
      </h2>
    </div>
  );
}
