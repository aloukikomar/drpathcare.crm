import React, { useState, useEffect } from "react";
import { globalApi } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();

  // Validate like old CRM
  const validateMobile = (v: string) => /^[0-9]{10}$/.test(v);
  const validateOtp = (v: string) => /^[0-9]{4}$/.test(v);

  // Timer effect (same as old CRM)
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      const id = setInterval(() => setTimer((t) => Math.max(t - 1, 0)), 1000);
      return () => clearInterval(id);
    }
  }, [step, timer]);

  // ------------------ SEND OTP ------------------
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

  // ------------------ VERIFY OTP ------------------
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

      // Store tokens & user like your axios expects
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log(JSON.stringify(data.user))

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(rgba(50, 32, 248, 0.3), rgba(255,255,255,0.3)),url('/login-bg.jpg') no-repeat center/cover",
      }}
    >
      {/* MAIN CARD – EXACT SIZE: width 400 / p=6 / radius 12px */}
      <div
        className="bg-white shadow-lg rounded-xl"
        style={{
          width: "400px",
          padding: "24px", // MUI p=6
          borderRadius: "12px", // MUI radius 3
        }}
      >
        {/* LOGO */}
        <img
          src="/logo1.png"
          alt="Logo"
          className="mx-auto"
          style={{
            width: "300px",
            height: "100px",
            objectFit: "contain",
          }}
        />

        {/* TITLE */}
        <p className="text-center text-xl font-medium mt-6 mb-6">
          Sign in to CRM
        </p>

        {/* STEP 1 — MOBILE */}
        {step === "mobile" && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#635bff] outline-none text-center"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !mobile}
              className="w-full bg-[#635bff] text-white py-2 rounded-md font-medium hover:bg-[#564ef5] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Get OTP"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              For any issue, contact support at{" "}
              <a
                href="mailto:info@drpathcare.com"
                className="font-semibold underline text-primary"
              >
                info@drpathcare.com
              </a>
            </p>
          </form>
        )}

        {/* STEP 2 — OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-center text-sm text-gray-600 mb-3">
              SMS sent to number <strong>{mobile}</strong>
            </p>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Enter OTP</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#635bff] outline-none text-center"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                required
              />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mb-2">
              <button
                type="submit"
                className="w-full bg-[#635bff] text-white py-2 rounded-md font-medium hover:bg-[#564ef5]"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => setStep("mobile")}
                className="w-full border border-gray-300 py-2 rounded-md font-medium hover:bg-gray-50"
              >
                Back
              </button>
            </div>

            {/* TIMER / RESEND */}
            {timer > 0 ? (
              <p className="text-center text-sm text-gray-600 mt-2">
                Resend OTP in {timer}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full text-[#635bff] text-sm font-medium mt-1 hover:underline"
              >
                Resend OTP
              </button>
            )}

            <p className="text-center text-sm text-gray-500 mt-4">
              For any issue, contact support at{" "}
              <a
                href="mailto:info@drpathcare.com"
                className="font-semibold underline text-primary"
              >
                info@drpathcare.com
              </a>
            </p>
          </form>
        )}

        {/* ERROR */}
        {error && (
          <p className="text-center text-red-500 mt-4 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
