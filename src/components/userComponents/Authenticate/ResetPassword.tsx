import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { updatePasswordApi } from "../../../services/user/api";
import { useState } from "react";

const ResetPassword = () => {
  const token = useParams().token;
  const naviage = useNavigate();
  const [loading,setLoading] = useState(false);
  const formik = useFormik({
    initialValues: {
      Password: "",
      ConfirmPassword: "",
    },
    validationSchema: Yup.object({
      Password: Yup.string()
        .required("Required")
        .min(6, "Must be at least 6 characters")
        .matches(/[A-Z]/, "Must contain at least one uppercase letter")
        .matches(/[a-z]/, "Must contain at least one lowercase letter")
        .matches(/[0-9]/, "Must contain at least one number"),
      ConfirmPassword: Yup.string()
        .required("Required")
        .oneOf([Yup.ref("Password"), null], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true)
        await updatePasswordApi(token, values.Password,)
        setLoading(false)
        toast.success("password changed successfully");
         naviage("/auth/signin")
      } catch (error) {
        setLoading(false)
        toast.error(error.response?.data?.error);
        console.log(error.response?.data?.error);
      }
      
    },
  });

  return (
    <div className="flex items-center justify-center w-full h-full text-gray-900">
      <div className="flex justify-center flex-1 max-w-lg m-0 bg-white sm:m-10 sm:rounded-lg">
        <div className="w-full p-6 sm:p-12">
          <div className="flex flex-col items-center ">
            <h1 className="text-2xl font-extrabold cursor-pointer xl:text-3xl font-outfit">
              Change Password
            </h1>
            <div className="flex-1 w-full mt-8">
              <div className="max-w-xs mx-auto">
                <input
                  className="w-full px-8 py-4 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  name="Password"
                  placeholder="Password"
                  value={formik.values.Password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.Password && formik.errors.Password ? (
                  <p className="ml-3 text-red-500">{formik.errors.Password}</p>
                ) : null}

                <input
                  className="w-full px-8 py-4 mt-4 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  name="ConfirmPassword"
                  placeholder="Confirm Password"
                  value={formik.values.ConfirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.ConfirmPassword &&
                formik.errors.ConfirmPassword ? (
                  <p className="ml-3 text-red-500">
                    {formik.errors.ConfirmPassword}
                  </p>
                ) : null}

                <button
                  onClick={() => formik.handleSubmit()}
                  type="button"
                  disabled={loading}
                  className="flex items-center justify-center w-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out rounded-lg bg-text-lavenderPurple hover:bg-background-PurpleHeart focus:shadow-outline focus:outline-none"
                >
                
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                    />
                  
                  <span className="ml-3">
                  {
                        loading ? "Sending..." : "Update Password"
                      }
                    </span>
                </button>
                <div className="my-3 text-center border-b">
                  <div className="inline-block px-2 text-sm font-medium leading-none tracking-wide text-gray-600 transform translate-y-1/2 bg-white">
                    <Link to="/auth/signin">Back to Signin?</Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
