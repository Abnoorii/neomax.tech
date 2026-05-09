"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const STORAGE_KEY = "neomax.faceOwnerDescriptor.v1";
const MATCH_THRESHOLD = 0.5;
const MODEL_URL = "/models";
const SAMPLES_REQUIRED = 5;

type Stage = "loading-models" | "ready-register" | "registering" | "ready-verify" | "verifying";

type VerdictKind = "match" | "stranger" | "no-face" | "idle";

interface Verdict {
  kind: VerdictKind;
  distance: number | null;
  message: string;
}

const IDLE_VERDICT: Verdict = { kind: "idle", distance: null, message: "Look at the camera." };

function descriptorToJSON(d: Float32Array): string {
  return JSON.stringify(Array.from(d));
}

function descriptorFromJSON(s: string): Float32Array {
  return new Float32Array(JSON.parse(s) as number[]);
}

function averageDescriptors(samples: Float32Array[]): Float32Array {
  const length = samples[0].length;
  const out = new Float32Array(length);
  for (const sample of samples) {
    for (let i = 0; i < length; i++) out[i] += sample[i];
  }
  for (let i = 0; i < length; i++) out[i] /= samples.length;
  return out;
}

export default function FaceAuthPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ownerRef = useRef<Float32Array | null>(null);
  const loopRef = useRef<number | null>(null);
  const samplesRef = useRef<Float32Array[]>([]);

  const [stage, setStage] = useState<Stage>("loading-models");
  const [verdict, setVerdict] = useState<Verdict>(IDLE_VERDICT);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        if (cancelled) return;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          ownerRef.current = descriptorFromJSON(stored);
          setStage("ready-verify");
        } else {
          setStage("ready-register");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load models.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (loopRef.current !== null) {
      cancelAnimationFrame(loopRef.current);
      loopRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
      audio: false,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
  }, []);

  const drawOverlay = useCallback((box: faceapi.Box | null, color: string) => {
    const overlay = overlayRef.current;
    const video = videoRef.current;
    if (!overlay || !video) return;
    overlay.width = video.videoWidth || 640;
    overlay.height = video.videoHeight || 480;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (!box) return;
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }, []);

  const captureDescriptor = useCallback(async (): Promise<{ descriptor: Float32Array; box: faceapi.Box } | null> => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const result = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!result) return null;
    return { descriptor: result.descriptor, box: result.detection.box };
  }, []);

  const startRegistration = useCallback(async () => {
    setError(null);
    setStage("registering");
    samplesRef.current = [];
    setProgress(0);
    try {
      await startCamera();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera access denied.");
      setStage("ready-register");
      return;
    }

    const tick = async () => {
      const captured = await captureDescriptor();
      if (captured) {
        drawOverlay(captured.box, "#22d3ee");
        samplesRef.current.push(captured.descriptor);
        setProgress(samplesRef.current.length);
        if (samplesRef.current.length >= SAMPLES_REQUIRED) {
          const owner = averageDescriptors(samplesRef.current);
          ownerRef.current = owner;
          localStorage.setItem(STORAGE_KEY, descriptorToJSON(owner));
          stopCamera();
          drawOverlay(null, "");
          setStage("ready-verify");
          setVerdict(IDLE_VERDICT);
          return;
        }
      } else {
        drawOverlay(null, "");
      }
      loopRef.current = requestAnimationFrame(tick);
    };
    loopRef.current = requestAnimationFrame(tick);
  }, [captureDescriptor, drawOverlay, startCamera, stopCamera]);

  const startVerification = useCallback(async () => {
    setError(null);
    if (!ownerRef.current) {
      setStage("ready-register");
      return;
    }
    setStage("verifying");
    setVerdict(IDLE_VERDICT);
    try {
      await startCamera();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera access denied.");
      setStage("ready-verify");
      return;
    }

    const tick = async () => {
      const captured = await captureDescriptor();
      if (!captured) {
        drawOverlay(null, "");
        setVerdict({ kind: "no-face", distance: null, message: "No face detected." });
      } else {
        const distance = faceapi.euclideanDistance(captured.descriptor, ownerRef.current!);
        if (distance < MATCH_THRESHOLD) {
          drawOverlay(captured.box, "#22c55e");
          setVerdict({ kind: "match", distance, message: "Access granted — owner recognized." });
        } else {
          drawOverlay(captured.box, "#ef4444");
          setVerdict({ kind: "stranger", distance, message: "Access denied — unknown face." });
        }
      }
      loopRef.current = requestAnimationFrame(tick);
    };
    loopRef.current = requestAnimationFrame(tick);
  }, [captureDescriptor, drawOverlay, startCamera]);

  const stopVerification = useCallback(() => {
    stopCamera();
    drawOverlay(null, "");
    setVerdict(IDLE_VERDICT);
    setStage("ready-verify");
  }, [drawOverlay, stopCamera]);

  const resetOwner = useCallback(() => {
    stopCamera();
    drawOverlay(null, "");
    localStorage.removeItem(STORAGE_KEY);
    ownerRef.current = null;
    samplesRef.current = [];
    setProgress(0);
    setVerdict(IDLE_VERDICT);
    setStage("ready-register");
  }, [drawOverlay, stopCamera]);

  const verdictColor =
    verdict.kind === "match"
      ? "text-green-400"
      : verdict.kind === "stranger"
        ? "text-red-400"
        : verdict.kind === "no-face"
          ? "text-yellow-400"
          : "text-textSecondary";

  return (
    <main className="section-shell">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-sm text-accentCyan">Owner-Only Face Recognition</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">Face Authentication</h1>
        <p className="mt-4 text-textSecondary">
          This terminal authenticates a single registered face. Register your face once; afterwards only that face will be granted access. Everything runs locally in your browser — your face descriptor never leaves this device.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
        )}

        <div className="glass-card mt-8 p-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
              playsInline
              muted
            />
            <canvas ref={overlayRef} className="absolute inset-0 h-full w-full -scale-x-100" />
            {stage === "loading-models" && (
              <div className="absolute inset-0 flex items-center justify-center text-textSecondary">
                Loading face recognition models…
              </div>
            )}
            {(stage === "ready-register" || stage === "ready-verify") && (
              <div className="absolute inset-0 flex items-center justify-center text-textSecondary">
                Camera idle
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {stage === "ready-register" && (
              <button onClick={startRegistration} className="rounded-full bg-neomax-gradient px-6 py-3 font-semibold">
                Register My Face
              </button>
            )}
            {stage === "registering" && (
              <div className="text-sm text-textSecondary">
                Capturing samples: <span className="font-mono text-accentCyan">{progress}/{SAMPLES_REQUIRED}</span> — keep your face centered.
              </div>
            )}
            {stage === "ready-verify" && (
              <>
                <button onClick={startVerification} className="rounded-full bg-neomax-gradient px-6 py-3 font-semibold">
                  Start Verification
                </button>
                <button onClick={resetOwner} className="rounded-full border border-white/20 px-5 py-3 text-sm">
                  Reset Registered Face
                </button>
              </>
            )}
            {stage === "verifying" && (
              <button onClick={stopVerification} className="rounded-full border border-white/20 px-5 py-3 text-sm">
                Stop
              </button>
            )}
          </div>

          {stage === "verifying" && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className={`text-lg font-semibold ${verdictColor}`}>{verdict.message}</p>
              {verdict.distance !== null && (
                <p className="mt-1 font-mono text-xs text-textSecondary">
                  distance = {verdict.distance.toFixed(3)} (threshold {MATCH_THRESHOLD})
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 text-sm text-textSecondary md:grid-cols-3">
          <div className="glass-card p-4">
            <p className="font-mono text-xs text-accentCyan">Step 1</p>
            <p className="mt-2">Register: capture {SAMPLES_REQUIRED} samples of your face from the webcam to build a private descriptor.</p>
          </div>
          <div className="glass-card p-4">
            <p className="font-mono text-xs text-accentCyan">Step 2</p>
            <p className="mt-2">Verify: live camera feed is matched against your stored descriptor in real time.</p>
          </div>
          <div className="glass-card p-4">
            <p className="font-mono text-xs text-accentCyan">Privacy</p>
            <p className="mt-2">Models and matching run entirely client-side. Your face data is stored only in this browser&apos;s localStorage.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
