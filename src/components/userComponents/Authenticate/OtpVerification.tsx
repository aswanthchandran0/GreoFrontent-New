import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import toast from "react-hot-toast";
import { resentOtpApi, verifyOtp } from "../../../services/user/api";
import { useNavigate } from "react-router-dom";
import { tokenService } from "../../../services/user/tokenService";

const OtpVerification: React.FC = () => {
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const navigate = useNavigate();
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
        toast.error("user id not found");
        return;
      }
      try {
        const response = await verifyOtp(user.id, otpCode);
        const { accessToken, refreshToken } = response.data.token;
        console.log(accessToken, refreshToken);
        console.log(response.data);
        tokenService.setToken(accessToken, refreshToken);
        toast.success("sign up successfully");

        navigate("/");
      } catch (error) {
        toast.error(error.response?.data?.error);
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
      document.getElementById(`otp-input-5`)?.focus(); // Focus on the last input
    }
  };



  //otp resent
  const [timeLeft, setTimeLeft] = useState(0);
  const timerDuration = 60;
  const localStorageKey = "otp-timer-expiry";
  
  const calculateTimeLeft = () => {
    const expiryTime = localStorage.getItem(localStorageKey);
    if (expiryTime) {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeRemaining = parseInt(expiryTime,10) - currentTime;
      return timeRemaining > 0 ? timeRemaining : 0;
    }
    return 0;
  }

  const startTimer = () => {
    const expiryTime = Math.floor(Date.now() / 1000) + timerDuration;
    localStorage.setItem(localStorageKey, expiryTime);
    setTimeLeft(timerDuration);
  };

  
  useEffect(() => {
    const savedTimeLeft = calculateTimeLeft();
    if (savedTimeLeft > 0) {
      setTimeLeft(savedTimeLeft);
    }
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(interval);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);


  const handleResentOtp = async () => {
    try {
      startTimer()
      await resentOtpApi(user?.email);
      toast.success("otp sent successfully");
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
  };

  return (
    <div className="max-w-md px-4 py-10 mx-auto text-center bg-white shadow sm:px-8 rounded-xl">
      <header className="mb-8">
        <h1 className="mb-1 text-2xl font-bold">Email Verification</h1>
        <p className="text-[15px] text-slate-500">
          Enter the 6-digit verification code that was sent to your Email.
        </p>
      </header>
      <form id="otp-form" onSubmit={formik.handleSubmit}>
        <div className="flex items-center justify-center gap-3">
          {formik.values.otp.map((value, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              className={`w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border ${
                formik.errors.otp && formik.errors.otp[index]
                  ? "border-red-500"
                  : "border-transparent"
              } hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100`}
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
              onPaste={handlePaste}
            />
          ))}
        </div>
        {formik.errors.otp && Array.isArray(formik.errors.otp) && (
          <div className="mt-2 text-sm text-red-500">
            {formik.errors.otp.join(", ")}
          </div>
        )}
        <div className="max-w-[260px] mx-auto mt-4">
          <button
            type="submit"
            className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150"
          >
            Verify Account
          </button>
        </div>
      </form>
      <div className="mt-4 text-sm text-slate-500">
        
        {
          timeLeft>0?
          <p
          className="font-medium text-indigo-500 hover:text-indigo-600">
          Resend OTP in {timeLeft} seconds
        </p>:
        (
          <>
 Didn't receive code?{" "}
        <a
          onClick={handleResentOtp}
          className="font-medium text-indigo-500 hover:text-indigo-600"
          href="#0"
        >
          Resend
        </a>
        </>
        )
        }
       
      </div>
    </div>
  );
};

export default OtpVerification;


//BUG: otp expire time was continusoly fetch from the local storage when user click and only stop when the timer was end