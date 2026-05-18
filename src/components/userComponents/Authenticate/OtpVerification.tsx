// src/pages/auth/OtpVerification.tsx

import React, { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import toast from "react-hot-toast";
import { resentOtpApi, verifyOtpApi } from "../../../services/user/api";
import { useNavigate } from "react-router-dom";
import { tokenService } from "../../../services/user/tokenService";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setUser } from "../../../redux/slices/userSlice";

const OtpVerification: React.FC = () => {
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const timerDuration = 60;
  const localStorageKey = "otp-timer-expiry";

  // Calculate time left from localStorage
  const calculateTimeLeft = (): number => {
    const expiryTime = localStorage.getItem(localStorageKey);
    if (expiryTime) {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeRemaining = parseInt(expiryTime, 10) - currentTime;
      return timeRemaining > 0 ? timeRemaining : 0;
    }
    return 0;
  };

  // Start timer
  const startTimer = () => {
    const expiryTime = Math.floor(Date.now() / 1000) + timerDuration;
    localStorage.setItem(localStorageKey, expiryTime.toString());
    setTimeLeft(timerDuration);
  };

  // Stop timer and clear storage
  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    localStorage.removeItem(localStorageKey);
    setTimeLeft(0);
  };

  // Initialize timer on mount
  useEffect(() => {
    const savedTimeLeft = calculateTimeLeft();
    if (savedTimeLeft > 0) {
      setTimeLeft(savedTimeLeft);
    } else {
      startTimer();
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer expired
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            localStorage.removeItem(localStorageKey);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timeLeft]);

  const formik = useFormik({
    initialValues: {
      otp: ["", "", "", "", "", ""],
    },
    validationSchema: Yup.object({
      otp: Yup.array()
        .of(
          Yup.string()
            .length(1, "Must be 1 character")
            .matches(/^\d$/, "Must be a digit")
        )
        .length(6, "Must be exactly 6 digits"),
    }),
    onSubmit: async (values) => {
      const otpCode = values.otp.join("");
      if (!user?.id) {
        toast.error("User ID not found");
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await verifyOtpApi(user.id, otpCode);
        
        // Handle new response structure
        const { user: userData, tokens } = response.data;
        
        console.log("Verification response:", response.data);
        
        // Save tokens
        tokenService.setToken(tokens.accessToken, tokens.refreshToken);
        
        // Save complete user data to Redux
        dispatch(setUser(userData));
        
        // Stop timer
        stopTimer();
        
        toast.success("Email verified successfully!");
        navigate("/");
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.error || "Invalid or expired OTP");
        } else {
          toast.error("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleChange = (index: number, value: string) => {
    const newOtp = [...formik.values.otp];
    newOtp[index] = value;

    formik.setFieldValue("otp", newOtp);

    // Move focus to next input if current input is filled
    if (value && index < newOtp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !formik.values.otp[index]) {
      if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`)?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (/^\d{6}$/.test(text)) {
      const digits = text.split("");
      formik.setFieldValue("otp", digits);
      // Focus on the last input
      document.getElementById(`otp-input-5`)?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) {
      toast.error(`Please wait ${timeLeft} seconds before resending`);
      return;
    }
    
    if (!user?.email) {
      toast.error("Email not found");
      return;
    }
    
    setIsResending(true);
    try {
      await resentOtpApi(user.email);
      startTimer();
      toast.success("OTP sent successfully!");
      // Reset OTP inputs
      formik.setFieldValue("otp", ["", "", "", "", "", ""]);
      // Focus on first input
      document.getElementById(`otp-input-0`)?.focus();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || "Failed to resend OTP");
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify Your Email
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              We've sent a verification code to
              <span className="font-medium text-gray-700 dark:text-gray-300 block mt-1">
                {user?.email || "your email address"}
              </span>
            </p>
          </div>

          {/* OTP Form */}
          <form onSubmit={formik.handleSubmit}>
            <div className="flex justify-center gap-2 sm:gap-3 mb-6">
              {formik.values.otp.map((value, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    formik.errors.otp && formik.errors.otp[index]
                      ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-transparent focus:border-purple-500 focus:ring-purple-200 dark:focus:ring-purple-800"
                  }`}
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  onPaste={handlePaste}
                  disabled={isLoading}
                />
              ))}
            </div>
            
            {formik.errors.otp && Array.isArray(formik.errors.otp) && (
              <p className="text-center text-sm text-red-500 mb-4">
                {formik.errors.otp.join(", ")}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Account"
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            {timeLeft > 0 ? (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Resend code in
                </p>
                <p className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">
                  {formatTime(timeLeft)}
                </p>
              </div>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors disabled:opacity-50"
              >
                {isResending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Didn't receive code? Resend"
                )}
              </button>
            )}
          </div>

          {/* Help Text */}
          <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500">
            Check your spam folder if you don't see the email in your inbox
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpVerification;