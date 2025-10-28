import React from "react";
export default function Button({ children, full, ...props }) {
  return (
    <button className={full ? "btn btn-full" : "btn"} {...props}>
      {children}
    </button>
  );
}
