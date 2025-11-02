import NavButton from "./NavButton";

export default function Navbar() {
  return (
    <header className="bg-zinc-900 text-white p-4 shadow w-full">
      <div className="max-w-1xl mx-auto flex justify-between items-center">
        {/* Left: Home */}
        <NavButton to="/" label="Home" />

        {/* Right: Other pages */}
        <nav className="flex space-x-4">
          <NavButton to="/transactions" label="Transactions" />
          <NavButton to="/accounts" label="Accounts" />
          <NavButton to="/performance" label="Performance" />
          <NavButton to="/categories" label="Categories" />
        </nav>
      </div>
    </header>
  );
}
