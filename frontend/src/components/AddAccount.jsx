import React, { useState } from "react";
import ActionButton from "../components/ActionButton";

export default function AddAccount({ accounts, setAccounts, onClose }) {
  const [newName, setNewName] = useState("");
  const [newBalance, setNewBalance] = useState();

  const handleSave = async () => {
    // Step 1: Optimistic UI
    const originalAccounts = [...accounts];
    const updatedAccounts = [
      ...accounts,
      { name: newName, amount: newBalance },
    ];
    setAccounts(updatedAccounts);
    onClose(); // Close the card

    try {
      // Step 2: Send to backend
      const payload = {
        account_name: newName,
        account_balance: newBalance,
      };

      const response = await fetch(
        "http://127.0.0.1:8000/accounts/addAccount",
        {
          method: "PUT", // or POST if your route uses it
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(`${error.detail}`);
        setAccounts(originalAccounts); // rollback on error
      }
    } catch (err) {
      console.error(err);
      setAccounts(originalAccounts); // rollback
      alert("Failed to add account!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-xl p-6 shadow-lg border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Add Account</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col space-y-4 mb-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400/40 outline-none transition-all"
            placeholder="Account Name"
          />

          <input
            type="number"
            value={newBalance}
            onChange={(e) => setNewBalance(parseFloat(e.target.value))}
            className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400/40 outline-none transition-all"
            placeholder="Balance"
          />
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <ActionButton variant="primary" onClick={handleSave}>
            Save
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
