import React from "react";
import { Edit2, Trash2 } from "lucide-react";

export default function CategoryButton({
  name,
  limit,
  spent,
  setSelectedCategory,
  onDelete,
  onSelect,
}) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const isOverBudget = spent > limit;

  return (
    <div
      onClick={() => onSelect(name)}
      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all"
    >
      {/* Header with actions */}
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-bold text-gray-800 text-lg truncate pr-2">
          {name}
        </h3>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={setSelectedCategory}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(name)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Spent vs Limit */}
      <div className="mb-1">
        <div className="flex justify-between items-baseline mb-1">
          <span className={`text-sm text-gray-500`}>
            R{spent?.toFixed(2) || "0.00"}
          </span>
          <span className="text-sm text-gray-500">
            of R{limit?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all ${
            isOverBudget ? "bg-red-500" : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Status */}
      <div className="text-xs font-medium">
        {isOverBudget ? (
          <span className="text-red-600">
            R{(spent - limit).toFixed(2)} over
          </span>
        ) : (
          <span className="text-green-600">
            R{(limit - spent).toFixed(2)} remaining
          </span>
        )}
      </div>
    </div>
  );
}
