"use client";

import { useState } from "react";
import { ModelConfig, availableModels } from "@/lib/models";

interface ModelSelectorProps {
  selectedModels: ModelConfig[];
  onModelToggle: (model: ModelConfig) => void;
  maxModels?: number;
}

export function ModelSelector({
  selectedModels,
  onModelToggle,
  maxModels = 4,
}: ModelSelectorProps) {
  const isSelected = (model: ModelConfig) =>
    selectedModels.some((m) => m.id === model.id);

  const canAddMore = selectedModels.length < maxModels;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Select AI Models</h2>
        <span className="text-sm text-slate-400">
          {selectedModels.length}/{maxModels} selected
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {availableModels.map((model) => {
          const selected = isSelected(model);
          const disabled = !selected && !canAddMore;

          return (
            <button
              key={model.id}
              onClick={() => !disabled && onModelToggle(model)}
              disabled={disabled}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                selected
                  ? "border-cyan-400 bg-cyan-900/30 shadow-lg shadow-cyan-500/20"
                  : disabled
                  ? "border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed"
                  : "border-slate-600 bg-slate-800/50 hover:border-slate-400 hover:bg-slate-700/50"
              }`}
            >
              {/* Selection indicator */}
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{model.avatar}</span>
                <span
                  className="font-semibold text-sm"
                  style={{ color: selected ? model.color : "#94a3b8" }}
                >
                  {model.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedModels.length < 2 && (
        <p className="text-amber-400 text-sm text-center">
          Select at least 2 models to start the race
        </p>
      )}
    </div>
  );
}

