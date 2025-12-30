import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import AddCategory from "../components/AddCategory";
import CategoryButton from "../components/CategoryButton";
import RecordTransaction from "../components/RecordTransaction";

export default function Categories({ setView }) {
  const [addCategory, setAddCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editedLimit, setEditedLimit] = useState("");
  const [editedName, setEditedName] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/categories/");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleDelete = async (name) => {
    // Step 1: Optimistic UI
    const originalCategories = [...categories];
    const updatedCategories = categories.filter((cat) => cat.name !== name);
    setCategories(updatedCategories);
    setDeleteTarget(null);

    // Step 2: Send request to backend
    try {
      const payload = { category_name: name };
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
        setCategories(originalCategories);
      }
    } catch (err) {
      console.error(err);
      setCategories(originalCategories);
      alert("Failed to delete category!");
    }
  };

  const handleSave = async (name) => {
    const payload = {
      cat_name: name,
      limit: parseFloat(editedLimit),
    };

    // Step 1: Optimistic update
    const originalCategories = [...categories];
    const updatedCategories = categories.map((cat) =>
      cat.name === name ? { name: name, limit: parseFloat(editedLimit) } : cat
    );
    setCategories(updatedCategories);
    setSelectedCategory(null);

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
        setCategories(originalCategories);
        return;
      }

      // Step 3: Optional re-fetch
      fetchCategories();
    } catch (err) {
      console.error(err);
      setCategories(originalCategories);
      alert("Failed to save changes!");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Categories</h2>
        <button
          onClick={() => setView("main")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <button
        onClick={() => setAddCategory(true)}
        className="w-full md:w-auto mb-6 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} className="mr-2" />
        Add Category
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8 col-span-full">
            No categories.
          </p>
        ) : (
          categories.map((cat) => (
            <CategoryButton
              key={cat.name}
              name={cat.name}
              limit={cat.limit}
              spent={cat.spent}
              setSelectedCategory={() => {
                setSelectedCategory(cat);
                setEditedName(cat.name);
                setEditedLimit(cat.limit.toString());
              }}
              onDelete={(name) => setDeleteTarget(name)}
              onSelect={(name) => {
                setSelectedCategoryName(name);
                setShowRecordModal(true);
              }}
            />
          ))
        )}
      </div>

      {addCategory && (
        <AddCategory
          categories={categories}
          setCategories={setCategories}
          onClose={() => setAddCategory(false)}
          onSuccess={fetchCategories}
        />
      )}

      {showRecordModal && (
        <RecordTransaction
          categoryName={selectedCategoryName}
          onClose={() => setShowRecordModal(false)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Delete Category
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete
              <span className="font-semibold text-red-600">
                {" "}
                {deleteTarget}{" "}
              </span>
              ? This action cannot be undone.
            </p>

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

      {selectedCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative">
            <button
              onClick={() => setSelectedCategory(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Category
            </h2>

            <div className="flex flex-col space-y-4 mb-6">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Category Name"
              />
              <input
                type="number"
                step="0.01"
                value={editedLimit}
                onChange={(e) => setEditedLimit(e.target.value)}
                className="p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Limit"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(selectedCategory.name)}
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
