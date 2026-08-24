import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Video, Square, ShieldAlert } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createJournalEntry, appendJournalAttachment } from "@/lib/journal.functions";

const SEGMENT_MS = 15000;

function stamp(d = new Date()) {
  return d.toLocaleString();
}

export function BodyCam({ onSaved }: { onSaved?: () => void }) {
  const { user } = useAuth();
  const createEntry = useServerFn(createJournalEntry);
  const appendAttachment = useServerFn(appendJournalAttachment);

  const [warned, setWarned] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [segments, setSegments] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const entryIdRef = useRef<string | null>(null);
  const partRef = useRef(0);
  const activeRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [recording]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      recorderRef.current?.state === "recording" && recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function uploadSegment(blob: Blob, index: number) {
    if (!user || !entryIdRef.current) return;
    const path = `${user.id}/bodycam-${entryIdRef.current}-${String(index).padStart(4, "0")}.webm`;
    const { error: upErr } = await supabase.storage.from("evidence").upload(path, blob, {
      contentType: blob.type || "video/webm",
      upsert: true,
    });
    if (upErr) throw new Error(upErr.message);
    await appendAttachment({
      data: {
        id: entryIdRef.current,
        attachment: {
          path,
          name: `Body cam clip ${index + 1}.webm`,
          type: blob.type || "video/webm",
          size: blob.size,
        },
        fields: { lastClipSavedAt: stamp() },
      },
    });
    setSegments((s) => s + 1);
    setStatus(`Saved clip ${index + 1} — safe in your incident report.`);
  }

  function runSegment(stream: MediaStream) {
    if (!activeRef.current) return;
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "";
    const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    recorderRef.current = rec;
    const chunks: Blob[] = [];
    const index = partRef.current++;

    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType || "video/webm" });
      if (blob.size) {
        uploadSegment(blob, index).catch((e: unknown) =>
          setError(e instanceof Error ? e.message : "A clip could not be saved."),
        );
      }
      if (activeRef.current) runSegment(stream);
    };

    rec.start();
    setTimeout(() => {
      if (rec.state === "recording") rec.stop();
    }, SEGMENT_MS);
  }

  async function start() {
    setError("");
    if (!user) {
      setError("Please log in first so your recording can be saved.");
      return;
    }
    try {
      setStatus("Starting…");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const row = await createEntry({
        data: {
          audience: "women",
          fields: {
            title: "Body cam recording",
            date: new Date().toISOString().slice(0, 10),
            what: `Body cam recording started ${stamp()}. Clips auto-save here every ${SEGMENT_MS / 1000} seconds.`,
          },
          attachments: [],
          audioPath: null,
        },
      });
      entryIdRef.current = (row as { id: string }).id;
      partRef.current = 0;
      setSegments(0);
      startedAtRef.current = Date.now();
      activeRef.current = true;
      setRecording(true);
      setStatus("Recording — every clip saves automatically.");
      runSegment(stream);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not start the camera.");
      setStatus("");
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
  }

  function stop() {
    activeRef.current = false;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setRecording(false);
    setStatus("Recording stopped. Everything is in your incident reports below.");
    setTimeout(() => onSaved?.(), 1500);
  }

  return (
    <div className="note-card space-y-4 p-6">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-emergency" />
        <div>
          <h2 className="font-serif text-2xl text-ink-900">Body cam</h2>
          <p className="mt-1 text-sm text-ink-700">
            Records video and sound from your device and saves it automatically as it goes — you never have to press
            save. Even if the app closes, the phone dies, or you have to run, every clip already recorded is kept.
          </p>
        </div>
      </div>

      {!warned ? (
        <div className="rounded-xl border border-emergency/30 bg-emergency/5 p-4 text-sm text-ink-800">
          <p className="font-semibold text-emergency">Before you start, please read this</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The recording is saved as a new <strong>incident report</strong> in your private journal.</li>
            <li>It saves by itself every {SEGMENT_MS / 1000} seconds — there is no “discard” button.</li>
            <li>To watch, share or delete it later, open <strong>Your incident reports</strong> below.</li>
            <li>Only your account can open it. Nothing is ever posted publicly.</li>
          </ul>
          <button type="button" className="btn-rose mt-4 w-full" onClick={() => setWarned(true)}>
            I understand — show the body cam button
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl bg-black">
            <video ref={videoRef} autoPlay muted playsInline className="h-56 w-full object-cover" />
          </div>

          {!recording ? (
            <button type="button" onClick={start} className="btn-rose flex w-full items-center justify-center gap-2">
              <Video className="h-5 w-5" /> Start body cam
            </button>
          ) : (
            <button
              type="button"
              onClick={stop}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-3 font-semibold text-cream-50"
            >
              <Square className="h-4 w-4" /> Stop recording · {Math.floor(seconds / 60)}:
              {String(seconds % 60).padStart(2, "0")} · {segments} clip{segments === 1 ? "" : "s"} saved
            </button>
          )}
        </>
      )}

      {status && <p className="text-xs text-ink-600">{status}</p>}
      {error && <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">{error}</div>}
    </div>
  );
}
