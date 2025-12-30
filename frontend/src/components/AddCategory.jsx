import React, { useState } from "react";
import ActionButton from "../components/ActionButton";

export default function AddCategory({ categories, setCategories, onClose }) {
  const [newName, setNewName] = useState("");
  const [newLimit, setNewLimit] = useState("");

  const handleSave = async () => {
    // Validation
    if (!newName.trim()) {
      alert("Please enter a category name");
      return;
    }

    const limitValue = parseFloat(newLimit);
    if (isNaN(limitValue) || limitValue <= 0) {
      alert("Please enter a valid limit greater than 0");
      return;
    }

    // Check for duplicate names
    if (
      categories.some(
        (cat) => cat.name.toLowerCase() === newName.trim().toLowerCase()
      )
    ) {
      alert("A category with this name already exists");
      return;
    }

    // Optimistic UI update
    const originalCategories = [...categories];
    const updatedCategories = [
      ...categories,
      { name: newName.trim(), limit: limitValue, spent: 0 },
    ];
    setCategories(updatedCategories);
    onClose();

    try {
      const payload = {
        category_name: newName.trim(),
        category_limit: limitValue,
      };
      const response = await fetch(
        "http://127.0.0.1:8000/categories/addCategory",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(error.detail);
        setCategories(originalCategories);
      }
    } catch (err) {
      console.error(err);
      setCategories(originalCategories);
      alert("Failed to add category!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg border border-gray-200 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Add Category
        </h2>

        {/* Inputs */}
        <div className="flex flex-col space-y-4 mb-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Category Name"
          />
          <input
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Limit"
            step="0.01"
            min="0"
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <ActionButton onClick={handleSave} variant="primary">
            Save
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
