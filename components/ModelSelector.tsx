"use client";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium text-zinc-400">Select AI Models</h2>
        <span className="text-xs text-zinc-600">
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
              className={`relative p-4 rounded-xl border text-left transition-all ${
                selected
                  ? "border-white/20 bg-white/5"
                  : disabled
                  ? "border-zinc-900 bg-zinc-950/50 opacity-40 cursor-not-allowed"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/50"
              }`}
            >
              {/* Selection indicator */}
              {selected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
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

              <div className="flex items-center gap-3">
                <span className="text-2xl">{model.avatar}</span>
                <div>
                  <span className="text-sm font-medium text-white block">
                    {model.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {model.gatewayId.split('/')[0]}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedModels.length < 2 && (
        <p className="text-amber-500/80 text-xs mt-4 text-center">
          Select at least 2 models to start
        </p>
      )}
    </div>
  );
}
