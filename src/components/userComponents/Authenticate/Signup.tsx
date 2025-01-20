import { useFormik } from "formik";
import  { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { GoogleSignUp, signUpUser } from "../../../redux/slices/userSlice";
import { AppDispatch } from "../../../redux/store";
import { ThreeDots } from "react-loader-spinner";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

const Signup = () => {
  const dispatch: AppDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      Name: "",
      Email: "",
      Password: "",
    },
    validationSchema: Yup.object({
      Name: Yup.string().required("Required"),
      Email: Yup.string().email("invalid email").required("Required"),
      Password: Yup.string()
        .required("Required")
        .min(6, "Must be at least 6 characters")
        .matches(/[A-Z]/, "Must contain at least one uppercase letter")
        .matches(/[a-z]/, "Must contain at least one lowercase letter")
        .matches(/[0-9]/, "Must contain at least one number"),
    }),

    onSubmit: async (values) => {
      setLoading(true);
      const action = await dispatch(
        signUpUser({
          name: values.Name,
          email: values.Email,
          password: values.Password,
        })
      );

      if (signUpUser.fulfilled.match(action)) {
        navigate("/auth/otpverify");
      }
      setLoading(false);
    },
  })

  const handleGoogleSignup = useGoogleLogin({
    onSuccess:async(response: { access_token: string }) => {
  const action   = await dispatch(GoogleSignUp(response.access_token))
    if(GoogleSignUp.fulfilled.match(action)){
      navigate("/")
    }
  },
    onError: (error)=>{
      console.log(error)
      toast.error("google signUp failed")
    }
  })


  return (
    <div className="flex items-center justify-center w-full h-full text-gray-900">
      <div className="flex justify-center flex-1 max-w-lg m-0 bg-white sm:m-10 sm:rounded-lg">
        <div className="w-full p-6 sm:p-12">
          <div className="flex flex-col items-center ">
            <h1 className="text-2xl font-extrabold cursor-pointer xl:text-3xl font-outfit">
              Sign Up
            </h1>

            <div className="flex-1 w-full mt-8">
              <div className="max-w-xs mx-auto">
                <input
                  className="w-full px-8 py-4 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="text"
                  placeholder="Name"
                  name="Name"
                  value={formik.values.Name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.Name && formik.errors.Name && (
                  <div className="pl-3 text-red-500">{formik.errors.Name}</div>
                )}
                <input
                  className="w-full px-8 py-4 mt-5 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  placeholder="Email"
                  name="Email"
                  value={formik.values.Email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.Email && formik.errors.Email && (
                  <div className="pl-3 text-red-500">{formik.errors.Email}</div>
                )}
                <input
                  className="w-full px-8 py-4 mt-5 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  placeholder="Password"
                  name="Password"
                  value={formik.values.Password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.Password && formik.errors.Password && (
                  <div className="pl-3 text-red-500">
                    {formik.errors.Password}
                  </div>
                )}
                <button
                  onClick={() => formik.handleSubmit()}
                  type="button"
                  className="flex items-center justify-center w-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out rounded-lg bg-text-lavenderPurple hover:bg-background-PurpleHeart focus:shadow-outline focus:outline-none"
                  disabled={loading} // Disabling the button when loading
                >
                  {loading ? (
                    <ThreeDots
                      height="10"
                      width="80"
                      color="#fff"
                      ariaLabel="three-dots-loading"
                    />
                  ) : (
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                        />
                      </svg>
                      <span className="ml-3">Sign Up</span>
                    </span>
                  )}
                </button>

                <span className="flex justify-center p-1 font-medium">
                  already have an account?
                  <Link
                    to="/auth"
                    className="pl-1 cursor-pointer text-text-deepViolet"
                  >
                    SignIn
                  </Link>
                </span>
              </div>

              <div className="my-5 text-center border-b">
                <div className="inline-block px-2 text-sm font-medium leading-none tracking-wide text-gray-600 transform translate-y-1/2 bg-white">
                  Or sign Up with Google
                </div>
              </div>

              <div className="flex flex-col items-center">
                <button
                onClick={()=>handleGoogleSignup()}
                 className="flex items-center justify-center w-full max-w-xs py-3 font-bold text-gray-800 transition-all duration-300 ease-in-out bg-green-100 rounded-lg shadow-sm focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline">
                  <div className="p-2 bg-white rounded-full">
                    <svg className="w-4" viewBox="0 0 533.5 544.3">
                      <path
                        d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
                        fill="#4285f4"
                      />
                      <path
                        d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
                        fill="#34a853"
                      />
                      <path
                        d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
                        fill="#fbbc04"
                      />
                      <path
                        d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
                        fill="#ea4335"
                      />
                    </svg>
                  </div>
                  <span className="ml-4">Sign Up with Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
