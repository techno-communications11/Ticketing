import React, { useState, useRef, useCallback, useEffect } from "react";
import { FaRegEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa"; // React Icons
import { apiRequest } from "../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "animate.css"; // For animations
import "../styles/Login.css"; // Custom CSS for pink theme

export function Login() {
  const ntidRef = useRef(null);
  const passwordRef = useRef(null);
  const [errors, setErrors] = useState({ ntid: "", password: "", general: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Disable scrolling when the component mounts
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Re-enable scrolling when the component unmounts
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  const validatePassword = useCallback((password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]|\\:;'\",.<>?/~`-])[A-Za-z\d!@#$%^&*()_+={}[\]|\\:;'\",.<>?/~`-]{8,20}$/;
    return passwordRegex.test(password);
  }, []);

  const validateInputs = (ntid, password) => {
    const errors = {};
    if (!ntid) errors.ntid = "NTID/Email is required.";
    if (!password) errors.password = "Password is required.";
    else if (!validatePassword(password)) {
      errors.password =
        "Password must be 8-20 characters with letters, digits, and special characters.";
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({ ntid: "", password: "", general: "" });

    const ntid = ntidRef.current.value.trim().toLowerCase();
    const password = passwordRef.current.value.trim();

    const validationErrors = validateInputs(ntid, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await apiRequest.post("/auth/login", { ntid, password });
      const { token } = data;

      localStorage.setItem("token", token);
      const { department } = jwtDecode(token);
      localStorage.setItem("dept", department);

      const departmentRoutes = {
        Employee: "/home",
        "District Manager": "/dmtabs",
        "Market Manager": "/markethome",
        SuperAdmin: "/superAdminHome",
        Internal: "/admincreateticket",
      };

      navigate(departmentRoutes[department] || "/departmenthome");
    } catch (err) {
      setErrors({
        ...errors,
        general:
          err.response?.data?.message ||
          "Something went wrong. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      
      className="container-fluid d-flex flex-column justify-content-center align-items-center bg-pink-light vh-100"
    >
      {isLoading ? (
        <div className="loader d-flex align-items-center justify-content-center" />
      ) : (
        <div className="container-fluid ">
          <h1 className="font-weight-bold text-center fw-bolder display-1 text-pink mb-5">
            Welcome Back..
          </h1>
          <div className="row justify-content-center align-items-center w-100 ">
            {/* Left Side: Logo */}
            <div className="p-5 col-12 col-md-6 d-flex justify-content-center align-items-center animate__animated animate__fadeInLeft">
              <img
                loading="lazy"
                width="500"
                height="300"
                className="img-fluid"
                srcSet="./logoT.webp"
                alt="Logo"
              />
            </div>

            {/* Right Side: Login Form */}
            <div className="col-12 col-md-6 d-flex justify-content-center align-items-center animate__animated animate__fadeInRight">
              <form
                className="p-4 rounded shadow-lg w-100 bg-white"
                onSubmit={handleSubmit}
                style={{ maxWidth: "500px" }}
              >
                <h1 className="font-weight-bold text-center mb-3 fs-2 fw-bolder text-pink">
                  Login
                </h1>

                {/* NTID Input */}
                <div className="form-group mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-pink text-white">
                      <FaUser />
                    </span>
                    <input
                      id="ntid"
                      type="text"
                      placeholder="Enter Email / NTID"
                      className="form-control border shadow-none"
                      ref={ntidRef}
                      aria-label="NTID"
                    />
                  </div>
                  {errors.ntid && (
                    <span className="text-danger small">{errors.ntid}</span>
                  )}
                </div>

                {/* Password Input */}
                <div className="form-group mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-pink text-white">
                      <FaLock />
                    </span>
                    <input
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Enter password"
                      className="form-control border shadow-none"
                      ref={passwordRef}
                      aria-label="Password"
                    />
                    <span
                      className="input-group-text text-pink"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      style={{ cursor: "pointer" }}
                    >
                      {passwordVisible ? <FaRegEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  {errors.password && (
                    <span className="text-danger small">{errors.password}</span>
                  )}
                </div>

                {/* Submit Button */}
                <div className="mb-3">
                  <button
                    type="submit"
                    className="btn btn-pink w-100 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                </div>

                {/* Error Message */}
                {errors.general && (
                  <p className="text-danger small text-center">
                    {errors.general}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}