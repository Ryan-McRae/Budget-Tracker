import React, { useState } from "react";
import ActionButton from "../components/ActionButton";

export default function AccountCard({
  account,
  onClose,
  accounts,
  setAccounts,
  fetchAccounts,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(account.name);
  const [editedAmount, setEditedAmount] = useState(account.amount);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${account.name}?`))
      return;

    // Step 1: Optimistic UI
    const originalAccounts = [...accounts];
    const updatedAccounts = accounts.filter((acc) => acc.name !== account.name);
    setAccounts(updatedAccounts); // remove immediately
    onClose(); // close the card

    // Step 2: Send request to backend
    try {
      const payload = { account_name: account.name };
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
        alert(`⚠️ ${error.detail}`);
        setAccounts(originalAccounts); // rollback on error
      }
    } catch (err) {
      console.error(err);
      setAccounts(originalAccounts); // rollback
      alert("Failed to delete account!");
    }
  };

  const handleSave = async () => {
    const payload = {
      old_name: account.name, // original name
      new_name: editedName, // possibly changed
      amount: parseFloat(editedAmount),
    };

    // Step 1: Optimistic update
    const originalAccounts = [...accounts];
    const updatedAccounts = accounts.map((acc) =>
      acc.name === account.name
        ? { name: editedName, amount: parseFloat(editedAmount) }
        : acc
    );
    setAccounts(updatedAccounts);
    onClose();

    // Step 2: Send request
    try {
      const response = await fetch("http://127.0.0.1:8000/accounts/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`⚠️ ${error.detail}`);
        setAccounts(originalAccounts); // rollback on error
        return;
      }

      // Step 3: Optional re-fetch
      fetchAccounts();
    } catch (err) {
      console.error(err);
      setAccounts(originalAccounts); // rollback
      alert("Failed to save changes!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-neutral-800 text-white rounded-lg p-8 w-11/12 max-w-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{account.name}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-cyan-400 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {!isEditing ? (
          <>
            <p className="mb-4">Balance: R {account.amount.toFixed(2)}</p>

            {/* Action buttons */}
            <div className="flex space-x-4">
              <ActionButton
                onClick={() => setIsEditing(true)}
                variant="primary"
              >
                Edit
              </ActionButton>
              <ActionButton onClick={handleDelete} variant="secondary">
                Delete
              </ActionButton>
            </div>
          </>
        ) : (
          <>
            {/* Editable form */}
            <div className="flex flex-col space-y-4 mb-4">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="p-2 rounded bg-zinc-600 text-white"
                placeholder="Account Name"
              />
              <input
                type="number"
                value={editedAmount}
                onChange={(e) => setEditedAmount(parseFloat(e.target.value))}
                className="p-2 rounded bg-zinc-600 text-white"
                placeholder="Amount"
              />
            </div>

            <div className="flex justify-end">
              <ActionButton onClick={handleSave} variant="primary">
                Save
              </ActionButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
