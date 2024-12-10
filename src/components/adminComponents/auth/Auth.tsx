import {  useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { adminAuthenticate } from "../../../redux/slices/adminSlice";


const Auth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      Email: "",
      Password: "",
    },
    validationSchema: Yup.object({
      Email: Yup.string().email("invalid email").required("Required"),
      Password: Yup.string().required("Required"),
    }),
    onSubmit: async(values) => {
    const action =   await dispatch(
        adminAuthenticate({email:values.Email,password:values.Password})
      )
       if(adminAuthenticate.fulfilled.match(action)){
         navigate("/admin");
       }

    },
  });

 
  
  return (
    <div className="flex items-center justify-center w-full h-full text-gray-900">
      <div className="flex justify-center flex-1 max-w-lg m-0 bg-white sm:m-10 sm:rounded-lg">
        <div className="w-full p-6 sm:p-12">
          <div className="flex flex-col items-center ">
            <h1 className="text-2xl font-extrabold cursor-pointer xl:text-3xl font-outfit">
              Admin
            </h1>

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
                <input
                  className="w-full px-8 py-4 mt-5 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  placeholder="Password"
                  name="Password"
                  value={formik.values.Password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.Password && formik.errors.Password ? (
                  <p className="ml-3 text-red-500">{formik.errors.Password}</p>
                ) : null}
          
            

                <button
                  onClick={() => formik.handleSubmit()}
                  type="button"
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
                  <span className="ml-3">Sign In</span>
                </button>
    
              </div>

           

      
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth
