import React from "react";
import ReminderList from "../components/ReminderList";
import ReminderForm from "../components/ReminderForm";
import Navbar from "../components/Navbar";

export default function Reminders() {
  return (
    <>
      <Navbar />
      <main className="reminders-main">
        <ReminderForm />
        <ReminderList />
      </main>
    </>
  );
}
