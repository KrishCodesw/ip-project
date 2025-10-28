import React from "react";
import Button from "./Button";

export default function ReminderItem({ reminder, onDelete }) {
  return (
    <div className="reminder-item-card">
      <div>
        <div className="reminder-message">{reminder.message}</div>
        <div className="reminder-meta">
          <span>{new Date(reminder.remindAt).toLocaleString()}</span>
          {reminder.recipientEmail && <span> | {reminder.recipientEmail}</span>}
          {reminder.recipientPhone && <span> | {reminder.recipientPhone}</span>}
        </div>
      </div>
      <Button style={{ marginLeft: "auto" }} onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}
