"use client";

import { useState } from "react";

interface Props {
  onSubmit: (question: string, apiKey: string) => void;
  loading: boolean;
}

export default function PromptInput({ onSubmit, loading }: Props) {
  const [question, setQuestion] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = () => {
    if (question.trim().length < 3) return;
    onSubmit(question.trim(), apiKey.trim());
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {/* Main question input */}
      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          placeholder="What question should I reason through?&#10;e.g. Should I move my startup to San Francisco?"
          rows={3}
          className="w-full bg-panel border border-border rounded-xl px-5 py-4 text-text font-body text-base placeholder-muted resize-none focus:outline-none focus:border-accent transition-colors duration-200"
        />
        <div className="absolute bottom-3 right-4 text-muted font-mono text-xs">
          ⌘↵ to run
        </div>
      </div>

      {/* API Key row */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="DeepSeek API key (optional — uses demo data if empty)"
            className="w-full bg-panel border border-border rounded-xl px-5 py-3 text-text font-mono text-sm placeholder-muted focus:outline-none focus:border-accent transition-colors duration-200 pr-16"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text-dim text-xs font-mono transition-colors"
          >
            {showKey ? "hide" : "show"}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading || question.trim().length < 3}
        className="group relative w-full py-4 rounded-xl font-display font-semibold text-base tracking-wide overflow-hidden
          bg-accent hover:bg-accent-bright disabled:opacity-40 disabled:cursor-not-allowed
          text-white transition-all duration-200 hover:shadow-[0_0_40px_rgba(124,106,247,0.4)]"
      >
        <span className="relative z-10">
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Reasoning...
            </span>
          ) : (
            "Visualize Thinking →"
          )}
        </span>
      </button>
    </div>
  );
}
