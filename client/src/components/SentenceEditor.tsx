import { useState, useEffect } from "react";
import { useStore } from "../modules/store";
import { requestChanges, updateSentence } from "../modules/lib";
import { Markdowner } from "./Markdowner";
import { InstructionsModal } from "./Instructions";
import { FileUploader } from "./FileUploader";

import { AIPromptEditor } from "./AIPromptEditor";
import { ManualEditor } from "./ManualEditor";
import { EditActions } from "./EditActions";
import type { EditMode } from "./types";

export const SentenceEditor = () => {
  const sentence = useStore((state) => state.sentence);
  const setSentence = useStore((s) => s.setSentence);

  const [editMode, setEditMode] = useState<EditMode>("none");
  const [draft, setDraft] = useState(sentence?.sentence || "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDraft(sentence?.sentence || "");
  }, [sentence?.sentence]);

  const handleSaveManual = async () => {
    if (!draft.trim()) return;
    setLoading(true);
    try {
      setSentence({
        hash: sentence?.hash || "",
        sentence: draft,
        status: "SUCCESS",
      });
      await updateSentence(sentence?.hash || "", draft);
      setEditMode("none");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = ({
    brief,
    hash,
    status,
  }: {
    brief: string;
    hash: string;
    status: string;
  }) => {
    setDraft(brief);
    setSentence({
      hash,
      sentence: brief,
      status: status as "SUCCESS" | "ERROR",
    });
    setEditMode("none");
  };

  const handleAIPromptSubmit = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true);
    try {
      const changes = await requestChanges(sentence?.hash || "", aiPrompt);
      setDraft(changes.sentence);
      setEditMode("none");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!draft.trim()) return;
    setLoading(true);
    try {
      setSentence({
        hash: sentence?.hash || "",
        sentence: draft,
        status: "SUCCESS",
      });
      await updateSentence(sentence?.hash || "", draft);
      setEditMode("none");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-auto flex flex-col items-center mb-20">
      <div className="flex flex-row items-center gap-4 mt-10 bg-gray-100 p-4 rounded-md w-fit justify-center">
        <InstructionsModal />
        <FileUploader onUploadSuccess={handleUploadSuccess} />
      </div>

      <div className="flex flex-row items-center gap-4 mt-10 bg-gray-200 p-4 rounded-md w-full">
        {editMode === "manual" ? (
          <ManualEditor
            value={draft}
            onChange={setDraft}
            onSave={handleSaveManual}
            loading={loading}
          />
        ) : (
          <Markdowner markdown={draft || sentence?.sentence || ""} />
        )}
      </div>

      {editMode === "none" && sentence?.status !== "ERROR" && (
        <div className="flex flex-col items-center gap-4 mt-4">
          <h2 className="text-md mt-4">
            ¿Qué quieres cambiar de esta sentencia?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="button-pj" onClick={() => setEditMode("manual")}>
              Editar manualmente
            </button>
            <button className="button-pj" onClick={() => setEditMode("ai")}>
              Solicitar cambios a la IA
            </button>
          </div>
        </div>
      )}

      {editMode === "ai" && (
        <AIPromptEditor
          prompt={aiPrompt}
          onPromptChange={setAiPrompt}
          onSubmit={handleAIPromptSubmit}
          loading={loading}
        />
      )}

      {editMode !== "none" && draft !== sentence?.sentence && (
        <EditActions
          onAccept={handleAccept}
          onReject={() => {
            setDraft(sentence?.sentence || "");
            setEditMode("none");
          }}
        />
      )}
    </div>
  );
};
