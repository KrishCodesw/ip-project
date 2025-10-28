import React from 'react';
import AuthForm from '../components/AuthForm';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="centered-page">
      <AuthForm mode="register" />
      <div style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}
