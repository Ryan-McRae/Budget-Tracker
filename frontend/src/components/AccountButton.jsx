import React from "react";

export default function AccountButton({ name, balance, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex justify-between items-center bg-neutral-800 text-white px-6 py-4 rounded-lg hover:bg-cyan-900 transition w-full"
    >
      <span className="font-semibold">{name}</span>
      <span className="font-mono">R {balance.toFixed(2)}</span>
    </button>
  );
}
