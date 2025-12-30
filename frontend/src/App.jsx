import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Accounts from "./pages/Accounts";
import Home from "./pages/home"; // create a simple Home if you don't have it yet
import Categories from "./pages/Categories";

function App() {
  return (
    <div className="min-h-screen  bg-gray-50 flex flex-col">
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
