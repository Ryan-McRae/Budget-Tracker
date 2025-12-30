import { useEffect, useState } from "react";
import React from "react";
import { ArrowRight } from "lucide-react";
import RecordTransaction from "../components/RecordTransaction";

export default function CategoryOverview({ setView }) {
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const openTransactionModal = (name) => {
    setSelectedCategoryName(name);
    setShowRecordModal(true);
  };

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => setView("categories")}
          className="flex items-center text-gray-700 hover:text-gray-900 cursor-pointer transition-colors mb-4"
        >
          <span className="text-lg font-semibold mr-2">Categories</span>
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const percentage = cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;

          return (
            <div
              key={cat.name}
              onClick={() => openTransactionModal(cat.name)}
              className="
                bg-white rounded-lg shadow-md p-5 cursor-pointer 
                transition-all hover:shadow-lg hover:shadow-blue-200
              "
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                {cat.name}
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spent</span>
                  <span className="font-semibold">
                    R{cat.spent.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-semibold">
                    R{cat.limit.toLocaleString()}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`
                      h-2 rounded-full 
                      ${cat.spent > cat.limit ? "bg-red-500" : "bg-blue-500"}
                    `}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showRecordModal && (
        <RecordTransaction
          categoryName={selectedCategoryName}
          onClose={() => setShowRecordModal(false)}
        />
      )}
    </>
  );
}
