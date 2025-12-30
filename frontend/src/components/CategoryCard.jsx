import React, { useState } from "react";
import ActionButton from "../components/ActionButton";
import RecordTransaction from "./RecordTransaction";

export default function CategoryCard({
  category,
  onClose,
  categories,
  setCategories,
  fetchCategories,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLimit, setEditedLimit] = useState(category.limit);
  const [isRecording, setIsRecording] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${category.name}?`))
      return;

    // Step 1: Optimistic UI
    const originalCategories = [...categories];
    const updatedCategories = categories.filter(
      (cat) => cat.name !== category.name
    );
    setCategories(updatedCategories); // remove immediately
    onClose(); // close the card

    // Step 2: Send request to backend
    try {
      const payload = { category_name: category.name };
      const response = await fetch(
        "http://127.0.0.1:8000/categories/deleteCategory",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(`${error.detail}`);
        setCategories(originalCategories); // rollback on error
      }
    } catch (err) {
      console.error(err);
      setCategories(originalCategories); // rollback
      alert("Failed to delete category!");
    }
  };

  const handleSave = async () => {
    const payload = {
      cat_name: category.name, // original name
      limit: parseFloat(editedLimit),
    };

    // Step 1: Optimistic update
    const originalCategories = [...categories];
    const updatedCategories = categories.map((cat) =>
      cat.name === category.name
        ? { name: category.name, limit: parseFloat(editedLimit) }
        : cat
    );
    setCategories(updatedCategories);
    onClose();

    // Step 2: Send request
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/categories/updateCategory",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(`${error.detail}`);
        setCategories(originalCategories); // rollback on error
        return;
      }

      // Step 3: Optional re-fetch
      fetchCategories();
    } catch (err) {
      console.error(err);
      setCategories(originalCategories); // rollback
      alert("Failed to save changes!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-neutral-800 text-white rounded-lg p-8 w-11/12 max-w-3xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{category.name}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-cyan-400 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {!isEditing ? (
          <>
            <p className="mb-4">Limit: R {category.limit.toFixed(2)}</p>

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

              <ActionButton
                onClick={() => setIsRecording(true)}
                variant="primary"
              >
                Record Transaction
              </ActionButton>
            </div>
            {isRecording && (
              <RecordTransaction
                categoryName={category.name}
                onClose={() => setIsRecording(false)}
              />
            )}
          </>
        ) : (
          <>
            {/* Editable form */}
            <div className="flex flex-col space-y-4 mb-4">
              <input
                type="number"
                value={editedLimit}
                onChange={(e) => setEditedLimit(parseFloat(e.target.value))}
                className="p-2 rounded bg-zinc-600 text-white"
                placeholder="Limit"
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
