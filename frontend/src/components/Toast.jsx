import React from "react";
export default function Toast({ message, type = "info", onClose }) {
  return (
    <div className={`toast toast-${type}`}>
      {message}
      <button onClick={onClose} className="toast-close">
        &times;
      </button>
    </div>
  );
}
