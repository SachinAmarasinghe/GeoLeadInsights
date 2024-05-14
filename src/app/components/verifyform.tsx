"use client";
import React, { useState } from "react";

interface VerificationInfo {
  validFormat: boolean;
  validSmtp: boolean;
  validMx: boolean;
}

const VerifyForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [verificationInfo, setVerificationInfo] =
    useState<VerificationInfo | null>(null);
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Email verification failed");
      }

      const data = await response.json();
      if (data.verificationInfo) {
        setVerificationInfo(data.verificationInfo);
      } else {
        throw new Error("Verification info missing in response");
      }
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : "Email verification failed";
      setError(message);
      console.error("Error verifying email:", message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Verify Email</button>
      </form>
      {error && <p>{error}</p>}
      {verificationInfo && (
        <div>
          <p>Verification Info:</p>
          <p>Valid Format: {String(verificationInfo.validFormat)}</p>
          <p>Valid SMTP: {String(verificationInfo.validSmtp)}</p>
          <p>Valid MX: {String(verificationInfo.validMx)}</p>
        </div>
      )}
    </div>
  );
};

export default VerifyForm;
