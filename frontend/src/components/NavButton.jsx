import { NavLink } from "react-router-dom";

export default function NavButton({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        px-4 py-2 rounded-md transition 
        ${
          isActive
            ? "text-gray-500"
            : "text-white hover:bg-zinc-700 hover:text-blue-400"
        }
        `
      }
    >
      {label}
    </NavLink>
  );
}
