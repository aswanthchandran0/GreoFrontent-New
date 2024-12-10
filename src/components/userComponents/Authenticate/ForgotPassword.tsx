import { Link} from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import {  forgotPasswordTokenGenerateAPI } from "../../../services/user/api";
import { useState } from "react";


const ForgotPassword = ()=>{
  const [loading,setLoading] = useState(false);
    const formik = useFormik({
        initialValues: {
          Email: "",
        },
        validationSchema: Yup.object({
          Email: Yup.string().email("invalid email").required("Required"),
        }),
        onSubmit: async(values) => {
            try{
              setLoading(true)
                await forgotPasswordTokenGenerateAPI(values.Email)
                setLoading(false)
                toast.success("check your email for reset password link")
            }catch(error){
              setLoading(false)
                toast.error(error.response?.data?.error)
                console.log(error.response?.data?.error)
            }
        },
      });
      
    return (
        <div className="flex items-center justify-center w-full h-full text-gray-900">
        <div className="flex justify-center flex-1 max-w-lg m-0 bg-white sm:m-10 sm:rounded-lg">
          <div className="w-full p-6 sm:p-12">
            <div className="flex flex-col items-center ">
              <h1 className="text-2xl font-extrabold cursor-pointer xl:text-3xl font-outfit">
              Find your account?
              </h1>
              <span className="p-2 text-sm font-golos">Enter the email associated with your account to change your password.</span>
              <div className="flex-1 w-full mt-8">
                <div className="max-w-xs mx-auto">
                  <input
                    className="w-full px-8 py-4 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="email"
                    name="Email"
                    placeholder="Email"
                    value={formik.values.Email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.Email && formik.errors.Email ? (
                    <p className="ml-3 text-red-500">{formik.errors.Email}</p>
                  ) : null}
                 
                  <button
                    onClick={() => formik.handleSubmit()}
                    type="button"
                    disabled={loading}
                    
                    className="flex items-center justify-center w-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out rounded-lg bg-text-lavenderPurple hover:bg-background-PurpleHeart focus:shadow-outline focus:outline-none"
                  >
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
                    <span className="ml-3">
                      {
                        loading ? "Sending..." : "Send Mail"
                      }
                      </span>
                  </button>
                  <div className="my-3 text-center border-b">
                <div className="inline-block px-2 text-sm font-medium leading-none tracking-wide text-gray-600 transform translate-y-1/2 bg-white">
                  <Link to="/auth/signin">Back to Signin?</Link>
                </div>
              </div>

                </div>
  
  
                <div className="flex flex-col items-center">
               
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default ForgotPassword