import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const BetPage = () => {
  const { token } = useContext(AuthContext);

  // State storage
  const [events, setEvents] = useState([]);
  const [bets, setBets] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Number of bets per page

  const [loading, setLoading] = useState(false);

  // Bet form
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [stake, setStake] = useState("");

  const [message, setMessage] = useState("");

  // ----------------------
  // GET EVENTS
  // ----------------------
  const fetchEvents = async () => {
    try {
      const res = await fetch("https://your-api.com/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) setEvents(data.data);
      else setMessage("Failed to fetch events.");
    } catch {
      setMessage("Network error while fetching events.");
    }
  };

  // ----------------------
  // GET BETS
  // ----------------------
  const fetchBets = async () => {
    try {
      const res = await fetch("https://your-api.com/api/bets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) setBets(data.data);
      else setMessage("Failed to fetch bets.");
    } catch {
      setMessage("Network error while fetching bets.");
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchBets();
  }, []);

  // ----------------------
  // PLACE BET (POST)
  // ----------------------
  const placeBet = async (e) => {
    e.preventDefault();

    if (!selectedEvent || !selectedMarket || !stake) {
      setMessage("Please fill all fields.");
      return;
    }

    const body = {
      eventId: selectedEvent,
      marketId: selectedMarket,
      stake: Number(stake),
    };

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("https://your-api.com/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage("Bet placed successfully!");
        setStake("");
        setSelectedMarket("");
        setSelectedEvent("");

        // Refresh bets & reset to page 1
        fetchBets();
        setCurrentPage(1);
      } else {
        setMessage(data.message || "Error placing bet.");
      }
    } catch {
      setLoading(false);
      setMessage("Network error while placing bet.");
    }
  };

  // ----------------------
  // Pagination Logic
  // ----------------------
  const totalPages = Math.ceil(bets.length / pageSize);

  const paginatedBets = bets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const selectedEventObj = events.find((e) => e._id === selectedEvent);
  const markets = selectedEventObj?.markets || [];

  return (
    <div style={styles.container}>
      <h1>Betting Page</h1>

      {/* ---------------------- */}
      {/* BET FORM */}
      {/* ---------------------- */}
      <div style={styles.card}>
        <h2>Place a Bet</h2>

        <form onSubmit={placeBet} style={styles.form}>
          {/* Event */}
          <label style={styles.label}>Select Event</label>
          <select
            style={styles.input}
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setSelectedMarket("");
            }}
          >
            <option value="">-- choose an event --</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>

          {/* Market */}
          <label style={styles.label}>Select Market</label>
          <select
            style={styles.input}
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            disabled={!selectedEvent}
          >
            <option value="">-- choose a market --</option>
            {markets.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} @ {m.odds}
              </option>
            ))}
          </select>

          {/* Stake */}
          <label style={styles.label}>Stake</label>
          <input
            type="number"
            min={1}
            style={styles.input}
            value={stake}
            onChange={(e) => setStake(e.target.value)}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Placing Bet..." : "Place Bet"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}
      </div>

      {/* ---------------------- */}
      {/* BETS LIST w/ PAGINATION */}
      {/* ---------------------- */}
      <div style={styles.card}>
        <h2>Your Bets</h2>

        {paginatedBets.length === 0 ? (
          <p>No bets to display.</p>
        ) : (
          <ul style={styles.list}>
            {paginatedBets.map((bet) => (
              <li key={bet._id} style={styles.listItem}>
                <strong>{bet.event.title}</strong>
                <br />
                Market: {bet.market.name} @ {bet.market.odds}
                <br />
                Stake: ${bet.stake}
                <br />
                Potential Win: ${bet.potentialWin}
                <br />
                Status: <strong>{bet.status}</strong>
                <br />
                <small>
                  Placed: {new Date(bet.placedAt).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}

        {/* PAGINATION UI */}
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                style={{
                  ...styles.pageNum,
                  ...(currentPage === page ? styles.activePage : {}),
                }}
              >
                {page}
              </button>
            );
          })}

          <button
            style={styles.pageBtn}
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetPage;

const styles = {
  container: {
    maxWidth: "900px",
    margin: "30px auto",
    padding: "10px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    marginBottom: "25px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
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
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
  label: { fontWeight: "bold" },
  list: { listStyle: "none", padding: 0 },
  listItem: { padding: "12px", borderBottom: "1px solid #eee" },
  message: { marginTop: "10px", fontWeight: "bold" },

  // Pagination
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    background: "#f7f7f7",
    fontSize: "14px",
    cursor: "pointer",
  },
  pageNum: {
    padding: "8px 12px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
  },
  activePage: {
    background: "#007bff",
    color: "white",
    borderColor: "#007bff",
  },
};