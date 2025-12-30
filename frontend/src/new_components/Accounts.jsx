import React, { useState, useEffect } from "react";
import { ArrowRight, Plus, Edit2, Trash2, X } from "lucide-react";
import AccountButton from "../components/AccountButton";
import AddAccount from "../components/AddAccount";

export default function Accounts({ setView }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [addAccount, setAddAccount] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedAmount, setEditedAmount] = useState("");

  const fetchAccounts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/accounts/");
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  const handleDelete = async (name) => {
    // Optimistic update
    const originalAccounts = [...accounts];
    const updatedAccounts = accounts.filter((acc) => acc.name !== name);
    setAccounts(updatedAccounts);
    setDeleteTarget(null); // Close modal

    try {
      const payload = { account_name: name };
      const response = await fetch(
        "http://127.0.0.1:8000/accounts/deleteAccount",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(error.detail);
        setAccounts(originalAccounts); // rollback
      }
    } catch (err) {
      console.error(err);
      setAccounts(originalAccounts); // rollback
      alert("Failed to delete account!");
    }
  };

  const handleSave = async (oldName) => {
    const payload = {
      old_name: oldName,
      new_name: editedName,
      amount: parseFloat(editedAmount),
    };

    const originalAccounts = [...accounts];

    // Optimistic update
    const updatedAccounts = accounts.map((acc) =>
      acc.name === oldName
        ? { ...acc, name: editedName, amount: parseFloat(editedAmount) }
        : acc
    );

    setAccounts(updatedAccounts);

    try {
      const response = await fetch("http://127.0.0.1:8000/accounts/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.detail);
        setAccounts(originalAccounts); // rollback
        return;
      }

      // Refresh data if needed
      fetchAccounts();

      // Close modal
      setSelectedAccount(null);
    } catch (err) {
      console.error(err);
      setAccounts(originalAccounts); // rollback
      alert("Failed to save changes!");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Accounts</h2>
        <button
          onClick={() => setView("main")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      <button
        className="cursor-pointer w-full md:w-auto mb-6 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => setAddAccount(true)}
      >
        <Plus size={20} className="mr-2" />
        Add Account
      </button>

      <div className="space-y-3">
        {accounts.map((acc) => (
          <AccountButton
            key={acc.name}
            name={acc.name}
            amount={acc.amount}
            setSelectedAccount={() => {
              setSelectedAccount(acc);
              setEditedName(acc.name);
              setEditedAmount(acc.amount.toString());
            }}
            onDelete={(name) => setDeleteTarget(name)}
          />
        ))}
      </div>

      {addAccount && (
        <AddAccount
          accounts={accounts}
          setAccounts={setAccounts}
          onClose={() => setAddAccount(false)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Delete Account
            </h2>

            {/* Warning text */}
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete
              <span className="font-semibold text-red-600">
                {" "}
                {deleteTarget}{" "}
              </span>
              ? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAccount && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedAccount(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Account
            </h2>

            {/* Editable form */}
            <div className="flex flex-col space-y-4 mb-6">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Account Name"
              />
              <input
                type="number"
                step="0.01"
                value={editedAmount}
                onChange={(e) => setEditedAmount(e.target.value)}
                className="p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Amount"
              />
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                onClick={() => handleSave(selectedAccount.name)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
