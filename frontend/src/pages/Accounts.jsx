import React, { Plus, useEffect, useState } from "react";
import AccountButton from "../components/AccountButton";
import AccountCard from "../components/AccountCard";
import AddAccount from "../components/AddAccount";
import ActionButton from "../components/ActionButton";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [addAccount, setAddAccount] = useState(false);
  const fetchAccounts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/accounts/");
      const data = await res.json();
      setAccounts(data); // update the accounts state
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="flex flex-col items-center mt-12 px-4 space-y-4 w-full">
      <ActionButton
        onClick={() => setAddAccount(true)}
        variant="primary"
        icon={Plus}
      >
        Add Account
      </ActionButton>
      {/* Render buttons for each account */}
      {accounts.map((account) => (
        <AccountButton
          name={account.name}
          balance={account.amount}
          onClick={() => setSelectedAccount(account)}
        />
      ))}

      {/* Render add acount if button is pressed*/}
      {addAccount && (
        <AddAccount
          accounts={accounts}
          setAccounts={setAccounts}
          onClose={() => setAddAccount(false)}
        />
      )}

      {/* Render AccountCard if an account is selected */}
      {selectedAccount && (
        <AccountCard
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          accounts={accounts} // pass current accounts array
          setAccounts={setAccounts} // pass setter to update state
          fetchAccounts={fetchAccounts} // optional: re-fetch after save
        />
      )}
    </div>
  );
}
