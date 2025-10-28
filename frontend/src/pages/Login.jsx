import React from 'react';
import AuthForm from '../components/AuthForm';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="centered-page">
      <AuthForm mode="login" />
      <div style={{ marginTop: 12 }}>
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
}
