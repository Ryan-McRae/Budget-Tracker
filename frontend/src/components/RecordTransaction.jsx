import React, { useState, useEffect } from "react";
import ActionButton from "../components/ActionButton";

export default function RecordTransaction({ categoryName, onClose }) {
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDesc, setTransactionDesc] = useState("");
  const [transactionAccount, setTransactionAccount] = useState("");
  const [accounts, setAccounts] = useState([]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/accounts/");
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSave = async () => {
    if (!transactionAmount || !transactionAccount) {
      alert("Please fill in all required fields before saving.");
      return;
    }

    try {
      const payload = {
        account_name: transactionAccount,
        category: categoryName,
        amount: parseFloat(transactionAmount),
        description: transactionDesc,
      };

      const response = await fetch(
        "http://127.0.0.1:8000/categories/recordTransaction",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to record transaction: ${response.status}`);
      }

      alert("Transaction recorded successfully!");
      setTransactionAmount("");
      setTransactionDesc("");
      setTransactionAccount("");
      onClose();
    } catch (error) {
      console.error("Error recording transaction:", error);
      alert("Failed to record transaction.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Record Transaction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Category Tag */}
        <div className="mb-6">
          <span className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
            {categoryName}
          </span>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (R)
            </label>
            <input
              type="number"
              step="0.01"
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={transactionDesc}
              onChange={(e) => setTransactionDesc(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What was this for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account
            </label>
            <select
              value={transactionAccount}
              onChange={(e) => setTransactionAccount(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Account</option>
              {accounts.map((account) => (
                <option key={account.name} value={account.name}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            Save Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
