import React, { useEffect, useState } from "react";
import ReminderItem from "./ReminderItem";
import { getReminders, deleteReminder } from "../api/reminders";
import { useAuth } from "../context/AuthContext";

export default function ReminderList() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchReminders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getReminders(token);
      setReminders(res.data);
    } catch (err) {
      console.error(
        "Failed to fetch reminders",
        err?.response?.data || err.message
      );
      alert("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    const handler = () => fetchReminders();
    window.addEventListener("reminderCreated", handler);
    return () => window.removeEventListener("reminderCreated", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await deleteReminder(id, token);
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Delete failed", err?.response?.data || err.message);
      alert("Failed to delete reminder");
    }
  };

  if (loading) return <div className="loader">Loading reminders...</div>;

  return (
    <div className="reminder-list">
      {reminders.length === 0 ? (
        <div className="empty-state">No reminders yet.</div>
      ) : (
        reminders.map((reminder) => (
          <ReminderItem
            key={reminder._id}
            reminder={reminder}
            onDelete={() => handleDelete(reminder._id)}
          />
        ))
      )}
    </div>
  );
}
