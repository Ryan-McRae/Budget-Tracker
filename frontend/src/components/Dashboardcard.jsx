import React from "react";

export default function DashboardCard({
  title,
  children,
  onClick,
  width = "100%", // default full width
  height = "auto", // default auto height
  className = "", // allow additional styling
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-neutral-800 text-white rounded-lg shadow-lg p-6 cursor-pointer 
                 hover:scale-105 transition-transform duration-200 flex flex-col justify-between ${className}`}
      style={{ width, height }}
    >
      {/* Card Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="text-cyan-400 font-bold text-xl">→</span>
      </div>

      {/* Card Content */}
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
