import React from "react";
import { Field, ErrorMessage } from "formik";
export default function Input({ label, name, ...props }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <Field id={name} name={name} {...props} className="input" />
      <ErrorMessage name={name} component="div" className="input-error" />
    </div>
  );
}
