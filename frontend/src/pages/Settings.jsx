import React, { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";

const SettingsModal = ({ isOpen, onClose }) => {
  const [startDay, setStartDay] = useState(25);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentSetting();
    }
  }, [isOpen]);

  const fetchCurrentSetting = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/settings/financial-month-start"
      );
      const data = await response.json();
      setStartDay(data.start_day);
    } catch (err) {
      console.error("Error fetching setting:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        "http://localhost:8000/settings/financial-month-start",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ start_day: parseInt(startDay) }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update setting");
      }

      setMessage({
        type: "success",
        text: "Financial month start day updated successfully!",
      });
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Loading settings...
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Month Start Day
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select the day of the month when your financial month begins
                (e.g., payday). Must be between 1-28.
              </p>
              <input
                type="number"
                min="1"
                max="28"
                value={startDay}
                onChange={(e) => setStartDay(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || startDay < 1 || startDay > 28}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
