import React from "react";
import ReminderList from "../components/ReminderList";
import ReminderForm from "../components/ReminderForm";

export default function Reminders() {
  return (
    <>
      <main className="reminders-main">
        <ReminderForm />
        <ReminderList />
      </main>
    </>
  );
}
