import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "./Button";
import Input from "./Input";
import { login as apiLogin, register as apiRegister } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

const registerSchema = Yup.object({
  username: Yup.string().min(2, "Too short").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Min 6 chars").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
});

export default function AuthForm({ mode }) {
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";
  const { login } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="auth-form-card">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <Formik
        initialValues={
          isLogin
            ? { email: "", password: "" }
            : { username: "", email: "", password: "", confirmPassword: "" }
        }
        validationSchema={isLogin ? loginSchema : registerSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            if (isLogin) {
              const res = await apiLogin({
                email: values.email,
                password: values.password,
              });
              const token = res.data.token;
              login(token);
              navigate("/");
            } else {
              const res = await apiRegister({
                username: values.username,
                email: values.email,
                password: values.password,
              });
              const token = res.data.token;
              login(token);
              navigate("/");
            }
          } catch (err) {
            console.error(err?.response?.data || err.message);
            alert(err?.response?.data?.msg || "Authentication failed");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            {!isLogin && <Input label="Username" name="username" type="text" />}
            <Input label="Email" name="email" type="email" />
            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
            />
            {!isLogin && (
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
              />
            )}
            <label style={{ fontSize: 14 }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((v) => !v)}
              />{" "}
              Show password
            </label>
            <Button type="submit" disabled={isSubmitting} full>
              {isLogin ? "Login" : "Register"}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
