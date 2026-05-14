"use client";

import { useState } from "react";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

export default function AuthForm({ mode, onSubmit, isSubmitting = false, error = "" }) {
  const [formValues, setFormValues] = useState(initialFormState);
  const [phoneError, setPhoneError] = useState("");

  const isSignup = mode === "signup";

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "phone") {
      setPhoneError("");
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSignup && formValues.phone) {
      const phoneDigits = formValues.phone.replace(/\D/g, "");

      if (
        phoneDigits.length < 7 ||
        phoneDigits.length > 15 ||
        !/^\+?[0-9\s-]+$/.test(formValues.phone.trim())
      ) {
        setPhoneError("Phone number must contain 7 to 15 digits.");
        return;
      }
    }

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
          {phoneError ? <p className="auth-helper-error">{phoneError}</p> : null}
        </div>
      ) : null}

      {isSignup ? (
        <div className="auth-field">
          <label htmlFor="phone" className="auth-label">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            className="auth-input"
            value={formValues.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="9876543210"
            pattern="^\\+?[0-9\\s-]{7,20}$"
            title="Use 7 to 15 digits. Spaces, hyphens, and a leading + are allowed."
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
