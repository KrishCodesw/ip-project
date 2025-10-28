import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Input from "./Input";
import Button from "./Button";
import { createReminder } from "../api/reminders";
import { useAuth } from "../context/AuthContext";

const schema = Yup.object({
  message: Yup.string().required("Required"),
  remindAt: Yup.string().required("Required"),
  recipientEmail: Yup.string().email("Invalid email"),
  recipientPhone: Yup.string(),
});

export default function ReminderForm() {
  const { token } = useAuth();

  return (
    <div className="reminder-form-card">
      <h3>Add Reminder</h3>
      <Formik
        initialValues={{
          message: "",
          remindAt: "",
          recipientEmail: "",
          recipientPhone: "",
        }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            await createReminder(values, token);
            // notify other components to refresh
            window.dispatchEvent(new CustomEvent("reminderCreated"));
            resetForm();
          } catch (err) {
            console.error(
              "Create reminder failed",
              err?.response?.data || err.message
            );
            alert(err?.response?.data?.msg || "Failed to create reminder");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Input label="Message" name="message" type="text" />
            <Input label="Remind At" name="remindAt" type="datetime-local" />
            <Input label="Recipient Email" name="recipientEmail" type="email" />
            <Input label="Recipient Phone" name="recipientPhone" type="text" />
            <Button type="submit" disabled={isSubmitting} full>
              Add Reminder
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
