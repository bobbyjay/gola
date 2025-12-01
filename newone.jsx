import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const SupportPage = () => {
  const { token } = useContext(AuthContext);

  // Ticket creation
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Ticket history & thread
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);

  // Thread replying
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState(null);
  const [replyPreview, setReplyPreview] = useState(null);

  const [responseMsg, setResponseMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ----------------------------
  // TICKET CREATION IMAGE PREVIEW
  // ----------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  // ----------------------------
  // REPLY IMAGE PREVIEW
  // ----------------------------
  const handleReplyImage = (e) => {
    const file = e.target.files[0];
    setReplyImage(file);

    if (file) setReplyPreview(URL.createObjectURL(file));
    else setReplyPreview(null);
  };

  // ----------------------------
  // POST: CREATE NEW TICKET
  // ----------------------------
  const submitNewTicket = async (e) => {
    e.preventDefault();
    if (!subject || !message) return setResponseMsg("All fields required.");

    setLoading(true);
    setResponseMsg("");

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("message", message);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("https://your-api.com/api/support", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setResponseMsg("Support ticket created.");
        setSubject("");
        setMessage("");
        setImage(null);
        setPreview(null);
        fetchTickets();
      } else {
        setResponseMsg(data.message || "Error creating ticket.");
      }
    } catch {
      setResponseMsg("Network error.");
      setLoading(false);
    }
  };

  // ----------------------------
  // GET: TICKET HISTORY
  // ----------------------------
  const fetchTickets = async () => {
    try {
      const res = await fetch("https://your-api.com/api/support/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) setTickets(data.data);
    } catch {
      setResponseMsg("Could not load tickets.");
    }
  };

  // ----------------------------
  // GET: TICKET THREAD (ADMIN + USER CHAT)
  // ----------------------------
  const loadThread = async (ticketId) => {
    try {
      const res = await fetch(`https://your-api.com/api/support/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setSelectedTicket(data.data);
        setThreadMessages(data.data.messages);
      }
    } catch {
      setResponseMsg("Unable to load chat thread.");
    }
  };

  // ----------------------------
  // POST: SEND REPLY IN THREAD
  // ----------------------------
  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText && !replyImage)
      return setResponseMsg("Message or image required.");

    const formData = new FormData();
    formData.append("message", replyText);
    if (replyImage) formData.append("image", replyImage);

    try {
      const res = await fetch(
        `https://your-api.com/api/support/${selectedTicket._id}/message`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setReplyText("");
        setReplyImage(null);
        setReplyPreview(null);

        // Refresh chat
        loadThread(selectedTicket._id);
      } else {
        setResponseMsg(data.message);
      }
    } catch {
      setResponseMsg("Network error sending reply.");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div style={styles.container}>
      <h1>Support Center</h1>

      {/* ---------------------------- */}
      {/* TICKET CREATION FORM */}
      {/* ---------------------------- */}
      <div style={styles.card}>
        <h2>Create Support Ticket</h2>

        <form onSubmit={submitNewTicket} style={styles.form}>
          <input
            type="text"
            placeholder="Subject"
            style={styles.input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <textarea
            placeholder="Describe your issue..."
            style={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <input type="file" accept="image/*" onChange={handleImageChange} />

          {preview && (
            <img src={preview} style={styles.imagePreview} alt="preview" />
          )}

          <button style={styles.button} disabled={loading}>
            {loading ? "Submitting..." : "Create Ticket"}
          </button>
        </form>

        {responseMsg && <p style={styles.message}>{responseMsg}</p>}
      </div>

      {/* ---------------------------- */}
      {/* TICKET LIST & THREAD */}
      {/* ---------------------------- */}
      <div style={styles.supportLayout}>
        {/* Ticket List */}
        <div style={styles.ticketList}>
          <h2>Support Tickets</h2>

          {tickets.map((t) => (
            <div
              key={t._id}
              style={styles.ticketItem}
              onClick={() => loadThread(t._id)}
            >
              <strong>{t.subject}</strong>
              <br />
              Status: {t.status}
              <br />
              <small>{new Date(t.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>

        {/* Threaded Messages */}
        <div style={styles.threadView}>
          {selectedTicket ? (
            <>
              <h2>{selectedTicket.subject}</h2>

              <div style={styles.threadBox}>
                {threadMessages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      ...styles.msgBubble,
                      ...(msg.senderRole === "admin"
                        ? styles.adminBubble
                        : styles.userBubble),
                    }}
                  >
                    <p>
                      <strong>{msg.senderRole.toUpperCase()}</strong>
                    </p>
                    <p>{msg.message}</p>

                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="sent"
                        style={{ width: "150px", borderRadius: "6px" }}
                      />
                    )}

                    <small>
                      {new Date(msg.sentAt).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={sendReply} style={styles.replyForm}>
                <textarea
                  placeholder="Type your reply..."
                  style={styles.textarea}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReplyImage}
                />

                {replyPreview && (
                  <img
                    src={replyPreview}
                    alt="preview"
                    style={styles.imagePreview}
                  />
                )}

                <button style={styles.button}>Send Reply</button>
              </form>
            </>
          ) : (
            <p>Select a ticket to view messages.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;

const styles = {
  container: { maxWidth: "1100px", margin: "30px auto" },
  card: {
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    marginBottom: "25px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  supportLayout: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
  },
  ticketList: {
    width: "30%",
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
    height: "600px",
    overflowY: "auto",
  },
  ticketItem: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },
  threadView: {
    width: "70%",
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.05)",
  },
  threadBox: {
    height: "450px",
    overflowY: "auto",
    padding: "10px",
    marginBottom: "20px",
    border: "1px solid #eee",
    borderRadius: "10px",
  },
  msgBubble: {
    padding: "12px",
    marginBottom: "10px",
    borderRadius: "10px",
    maxWidth: "80%",
  },
  userBubble: {
    background: "#d1e7ff",
    alignSelf: "flex-end",
  },
  adminBubble: {
    background: "#ffe9c9",
    alignSelf: "flex-start",
  },
  replyForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "12px", borderRadius: "6px", border: "1px solid #ccc" },
  textarea: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "vertical",
  },
  button: {
    padding: "14px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  message: { marginTop: "10px", fontWeight: "bold" },
  imagePreview: { width: "120px", borderRadius: "6px" },
};