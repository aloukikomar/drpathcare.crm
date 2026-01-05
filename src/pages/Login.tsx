import React, { useState, useEffect } from "react";
import { globalApi } from "../api/axios";
import { useNavigate } from "react-router-dom";

type Step = "mobile" | "otp" | "mpin";

export default function LoginPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [mpin, setMpin] = useState("");

  const [step, setStep] = useState<Step>("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();

  /* ---------------- VALIDATION ---------------- */
  const validateMobile = (v: string) => /^[0-9]{10}$/.test(v);
  const validateOtp = (v: string) => /^[0-9]{4}$/.test(v);
  const validateMpin = (v: string) => /^[0-9]{6}$/.test(v);

  /* ---------------- OTP TIMER ---------------- */
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const id = setInterval(() => setTimer((t) => Math.max(t - 1, 0)), 1000);
      return () => clearInterval(id);
    }
  }, [step, timer]);

  /* ---------------- SEND OTP ---------------- */
  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateMobile(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await globalApi.post("auth/send-otp/", { mobile });

      setStep("otp");
      setTimer(30);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateOtp(otp)) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await globalApi.post("auth/verify-otp/", {
        mobile,
        otp,
      });

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY MPIN ---------------- */
  const handleVerifyMpin = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateMpin(mpin)) {
      setError("Please enter a valid 6-digit MPIN");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await globalApi.post("auth/verify-mpin/", {
        mobile,
        mpin,
      });

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid MPIN");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(rgba(50, 32, 248, 0.3), rgba(255,255,255,0.3)),url('/login-bg.jpg') no-repeat center/cover",
      }}
    >
      <div
        className="bg-white shadow-lg rounded-xl"
        style={{
          width: "400px",
          padding: "24px",
          borderRadius: "12px",
        }}
      >
        {/* LOGO */}
        <img
          src="/logo1.png"
          alt="Logo"
          className="mx-auto"
          style={{ width: "300px", height: "100px", objectFit: "contain" }}
        />

        <p className="text-center text-xl font-medium mt-6 mb-6">
          Sign in to CRM
        </p>

        {/* ========== MOBILE STEP ========== */}
        {step === "mobile" && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-center"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                required
              />
            </div>

            {/* TWO BUTTONS SIDE BY SIDE */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#635bff] text-white py-2 rounded-md font-medium"
              >
                {loading ? "Sending..." : "Get OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("mpin");
                }}
                className="w-full border py-2 rounded-md font-medium"
              >
                Login with MPIN
              </button>
            </div>
          </form>
        )}

        {/* ========== OTP STEP ========== */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-center text-sm mb-3">
              SMS sent to <strong>{mobile}</strong>
            </p>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Enter OTP</label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2 text-center"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                required
              />
            </div>

            <div className="flex gap-3 mb-2">
              <button
                type="submit"
                className="w-full bg-[#635bff] text-white py-2 rounded-md"
              >
                Verify OTP
              </button>

              <button
                type="button"
                onClick={() => setStep("mobile")}
                className="w-full border py-2 rounded-md"
              >
                Back
              </button>
            </div>

            {timer > 0 ? (
              <p className="text-center text-sm">
                Resend OTP in {timer}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full text-[#635bff] text-sm hover:underline"
              >
                Resend OTP
              </button>
            )}
          </form>
        )}

        {/* ========== MPIN STEP ========== */}
        {step === "mpin" && (
          <form onSubmit={handleVerifyMpin}>
            <p className="text-center text-sm mb-3">
              Login with MPIN for <strong>{mobile}</strong>
            </p>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Enter MPIN</label>
              <input
                type="password"
                className="w-full border rounded-md px-3 py-2 text-center"
                value={mpin}
                onChange={(e) =>
                  setMpin(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="w-full bg-[#635bff] text-white py-2 rounded-md"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => setStep("mobile")}
                className="w-full border py-2 rounded-md"
              >
                Back
              </button>
            </div>
          </form>
        )}
        <p className="text-center text-sm text-gray-500 mt-4"> For any issue, contact support at{" "} <a href="mailto:info@drpathcare.com" className="font-semibold underline text-primary" > info@drpathcare.com </a> </p>

        {error && (
          <p className="text-center text-red-500 mt-4 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
