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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableModels.map((model) => {
          const selected = isSelected(model);
          const disabled = !selected && !canAddMore;

          return (
            <button
              key={model.id}
              onClick={() => !disabled && onModelToggle(model)}
              disabled={disabled}
              style={{
                borderColor: selected ? `${model.color}40` : undefined,
              }}
              className={`relative p-5 rounded-xl border text-left transition-all ${
                selected
                  ? "bg-white/5 shadow-lg"
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

              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 flex-shrink-0 relative">
                  <img
                    src={model.icon}
                    alt={model.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-base font-medium text-white block">
                    {model.name}
                  </span>
                  <span
                    className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded inline-block mt-0.5"
                    style={{
                      color: model.color,
                      backgroundColor: `${model.color}15`,
                    }}
                  >
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
