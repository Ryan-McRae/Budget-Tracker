import React, { Plus, useEffect, useState } from "react";
import CategoryButton from "../components/CategoryButton";
import ActionButton from "../components/ActionButton";
import CategoryCard from "../components/CategoryCard";
import AddCategory from "../components/AddCategory";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [addCategory, setAddCategory] = useState(false);
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/categories/");
      const data = await res.json();
      setCategories(data); // update the accounts state
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col items-center mt-12 px-4 space-y-4 w-full">
      <ActionButton
        onClick={() => setAddCategory(true)}
        variant="primary"
        icon={Plus}
      >
        Add Category
      </ActionButton>
      {categories.map((category) => (
        <CategoryButton
          name={category.name}
          limit={category.limit}
          spent={category.spent}
          onClick={() => setSelectedCategory(category)}
        />
      ))}
      {/* Render add acount if button is pressed*/}
      {addCategory && (
        <AddCategory
          categories={categories}
          setCategories={setCategories}
          onClose={() => setAddCategory(false)}
        />
      )}

      {/* Render CategoryCard if a category is selected */}
      {selectedCategory && (
        <CategoryCard
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          categories={categories} // pass current categories array
          setCategories={setCategories} // pass setter to update state
          fetchCategories={fetchCategories} // optional: re-fetch after save
        />
      )}
    </div>
  );
}
