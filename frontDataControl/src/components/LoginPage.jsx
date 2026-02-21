"use client";

import { useState, useRef, useEffect } from "react";
import { sendCode, verifyCode, saveSession } from "@/lib/auth";

export default function LoginPage({ onAuthenticated }) {
  const [step, setStep] = useState("initial"); // initial | codeSent | verifying
  const [maskedEmail, setMaskedEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleSendCode() {
    setLoading(true);
    setError("");
    try {
      const result = await sendCode();
      if (result.success) {
        setMaskedEmail(result.email);
        setStep("codeSent");
        setCountdown(60);
        // Focus first input
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(result.error || "Erreur d'envoi");
      }
    } catch {
      setError("Impossible de contacter le serveur");
    }
    setLoading(false);
  }

  function handleCodeChange(index, value) {
    if (!/^\d*$/.test(value)) return; // digits only
    const newCode = [...code];
    newCode[index] = value.slice(-1); // single digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every((d) => d !== "") && newCode.join("").length === 6) {
      submitCode(newCode.join(""));
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
      submitCode(pasted);
    }
  }

  async function submitCode(fullCode) {
    setLoading(true);
    setError("");
    setStep("verifying");
    try {
      const result = await verifyCode(fullCode);
      if (result.success && result.token) {
        saveSession(result.token);
        onAuthenticated();
      } else {
        setError(result.error || "Code invalide");
        setStep("codeSent");
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError("Erreur de vérification");
      setStep("codeSent");
    }
    setLoading(false);
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__icon">🎀</div>
        <h1 className="login__title">Administration</h1>
        <p className="login__subtitle">La Mina à La Pate</p>

        {step === "initial" && (
          <>
            <p className="login__text">
              Un code de connexion sera envoyé à l&apos;adresse email de la propriétaire.
            </p>
            <button
              className="login__btn"
              onClick={handleSendCode}
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Se connecter"}
            </button>
          </>
        )}

        {(step === "codeSent" || step === "verifying") && (
          <>
            <p className="login__text">
              Code envoyé à <strong>{maskedEmail}</strong>
            </p>
            <div className="login__code" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="login__code-input"
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={step === "verifying"}
                />
              ))}
            </div>

            {step === "verifying" && (
              <p className="login__verifying">Vérification...</p>
            )}

            <button
              className="login__resend"
              onClick={handleSendCode}
              disabled={countdown > 0 || loading}
            >
              {countdown > 0
                ? `Renvoyer le code (${countdown}s)`
                : "Renvoyer le code"}
            </button>
          </>
        )}

        {error && <p className="login__error">{error}</p>}
      </div>
    </div>
  );
}
