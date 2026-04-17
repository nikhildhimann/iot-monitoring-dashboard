"use client";

import { useState } from "react";

const initialFormState = {
  name: "",
  email: "",
  password: "",
};

export default function AuthForm({ mode, onSubmit, isSubmitting = false, error = "" }) {
  const [formValues, setFormValues] = useState(initialFormState);

  const isSignup = mode === "signup";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = isSignup
      ? formValues
      : {
          email: formValues.email,
          password: formValues.password,
        };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {isSignup ? (
        <div className="auth-field">
          <label htmlFor="name" className="auth-label">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            className="auth-input"
            value={formValues.name}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="e.g. John Doe"
            required
          />
        </div>
      ) : null}

      <div className="auth-field">
        <label htmlFor="email" className="auth-label">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          className="auth-input"
          value={formValues.email}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="e.g. name@example.com"
          required
        />
      </div>

      <div className="auth-field">
        <label htmlFor="password" className="auth-label">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className="auth-input"
          value={formValues.password}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="••••••••"
          minLength={8}
          required
        />
      </div>

      {error ? <p className="auth-error">{error}</p> : null}

      <button type="submit" className="auth-submit" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : isSignup ? "Create Account" : "Sign In"}
      </button>
    </form>
  );
}
