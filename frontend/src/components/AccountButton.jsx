import React from "react";
import { ArrowRight, Plus, Edit2, Trash2, X } from "lucide-react";

export default function AccountButton({
  name,
  amount,
  setSelectedAccount,
  onDelete,
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div>
        <h3 className="font-semibold text-gray-800">{name}</h3>
        <p
          className={`text-lg ${
            amount >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          R{Math.abs(amount).toLocaleString()}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          onClick={() => setSelectedAccount(name)}
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(name)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
