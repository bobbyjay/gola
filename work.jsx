import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const walletTypes = [
  "Trust Wallet",
  "PayPal",
  "Coinbase",
  "Binance",
  "Apple Pay",
];

const WithdrawalPage = () => {
  const { token } = useContext(AuthContext);

  const [amount, setAmount] = useState("");
  const [walletType, setWalletType] = useState(walletTypes[0]);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !walletAddress) {
      setResponseMsg("Please fill all fields.");
      return;
    }

    const body = {
      amount: Number(amount),
      walletType,
      walletAddress,
    };

    try {
      setLoading(true);
      setResponseMsg("");

      const res = await fetch("https://your-api.com/api/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // if required
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setResponseMsg(data.message);
        setAmount("");
        setWalletAddress("");
      } else {
        setResponseMsg(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      setLoading(false);
      setResponseMsg("Network or server error.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Withdrawal Request</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Amount */}
        <label style={styles.label}>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
          min={1}
        />

        {/* Wallet Type */}
        <label style={styles.label}>Wallet Type</label>
        <select
          value={walletType}
          onChange={(e) => setWalletType(e.target.value)}
          style={styles.input}
        >
          {walletTypes.map((wallet) => (
            <option key={wallet} value={wallet}>
              {wallet}
            </option>
          ))}
        </select>

        {/* Wallet Address */}
        <label style={styles.label}>Wallet Address</label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Submitting..." : "Submit Withdrawal"}
        </button>
      </form>

      {/* Response Message */}
      {responseMsg && <p style={styles.response}>{responseMsg}</p>}
    </div>
  );
};

export default WithdrawalPage;

const styles = {
  container: {
    maxWidth: "400px",
    margin: "40px auto",
    padding: "20px",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "3px",
  },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "14px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  response: {
    marginTop: "20px",
    fontSize: "16px",
    fontWeight: "bold",
  },
};