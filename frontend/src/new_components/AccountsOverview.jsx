import React, { useState, useEffect } from "react";
import { ArrowRight, Plus, Edit2, Trash2, X } from "lucide-react";

export default function AccountsOverview({ setView }) {
  // Add setView as a prop
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

  // Calculate total balance from fetched accounts
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.amount, 0);

  return (
    <>
      {/* Accounts Overview Card */}
      <div className="bg-white rounded-lg shadow-md p-6 lg:w-[40%] min-h-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Accounts Overview
          </h2>
          <button
            onClick={() => setView("accounts")}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span className="mr-1 cursor-pointer">View All</span>
            <ArrowRight className="cursor-pointer" size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="text-3xl font-bold text-gray-800">
            R{totalBalance.toLocaleString()}
          </div>
          <p className="text-gray-600">Total Balance</p>
          <div className="pt-2 space-y-2">
            {accounts.slice(0, 5).map((acc) => (
              <div key={acc.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{acc.name}</span>
                <span
                  className={
                    acc.amount >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  R{Math.abs(acc.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
