import React from "react";

export default function ActionButton({
  children,
  onClick,
  icon: Icon,
  variant = "primary",
  fullWidth = false,
}) {
  const baseClasses =
    "flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition";
  const variantClasses = variant === "primary"? 
        "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-red-600 text-white hover:bg-red-700";
        
  const widthClass = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${widthClass} flex space-x-2`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </button>
  );
}
