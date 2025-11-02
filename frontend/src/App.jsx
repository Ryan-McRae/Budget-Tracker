import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Accounts from "./pages/Accounts";
import Home from "./pages/home"; // create a simple Home if you don't have it yet

function App() {
  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/accounts" element={<Accounts />} />
          {/* optional placeholders */}
          <Route
            path="/transactions"
            element={<div className="p-6 text-white">Transactions (TODO)</div>}
          />
          <Route
            path="/performance"
            element={<div className="p-6 text-white">Performance (TODO)</div>}
          />
          <Route
            path="/categories"
            element={<div className="p-6 text-white">Categories (TODO)</div>}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
