import React, { useState } from "react";
import {
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  X,
  Settings as SettingsIcon,
} from "lucide-react";
import AccountButton from "../components/AccountButton";
import AccountsOverview from "../new_components/AccountsOverview";
import Accounts from "../new_components/Accounts";
import CategoryOverview from "../new_components/CategoriesOverview";
import Categories from "../new_components/Categories";
import SettingsModal from "./Settings";

const BudgetApp = () => {
  const [view, setView] = useState("main"); // main, accounts, categories, performance
  const [showSettings, setShowSettings] = useState(false); // Add this

  const monthlySpent = 0;
  const monthlyBudget = 0;

  return (
    <div className="w-full h-full overflow-auto bg-gray-50">
      <div className="w-full p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome to SimplyFin
          </h1>
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <SettingsIcon size={20} />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
        {view === "main" && (
          <>
            {/* Top Cards Row */}
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-6">
              {/* Accounts Overview Card */}
              <AccountsOverview setView={setView}> </AccountsOverview>

              {/* Performance Overview Card */}
              <div className="bg-white rounded-lg shadow-md p-6 lg:flex-1 min-h-[400px]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">
                    This Month
                  </h2>
                  <button
                    onClick={() => setView("performance")}
                    className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span className="mr-1">Performance</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-800">
                      ${monthlySpent.toLocaleString()}
                    </div>
                    <p className="text-gray-600">
                      of ${monthlyBudget.toLocaleString()} spent
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        monthlySpent > monthlyBudget
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (monthlySpent / monthlyBudget) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {monthlyBudget - monthlySpent >= 0
                      ? `$${(
                          monthlyBudget - monthlySpent
                        ).toLocaleString()} remaining`
                      : `$${(
                          monthlySpent - monthlyBudget
                        ).toLocaleString()} over budget`}
                  </p>
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <CategoryOverview setView={setView}></CategoryOverview>
          </>
        )}
        {view === "accounts" && <Accounts setView={setView}></Accounts>}
        {view === "categories" && <Categories setView={setView}></Categories>}
        {view === "performance" && <Performance setView={setView} />}{" "}
        {/* Update this */}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default BudgetApp;
