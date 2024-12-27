import React, { useRef, useState, useCallback } from "react";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { apiRequest } from "../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

export function Login() {
  const ntidRef = useRef(null);
  const passwordRef = useRef(null);
  const [errors, setErrors] = useState({ ntid: "", password: "", general: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center mt-5 max-vh-100 ">
      {isLoading ? (
        <div className="loader d-flex align-items-center justify-content-center">
          
        </div>
      ) : (
        <>
          <div className="my-2 text-center mt-5">
            <p
              style={{
                color: "#E10174",
                fontFamily: "Arial, sans-serif", 
                fontWeight: "500",
                fontSize: "1.5rem", 
                display: "inline-block",
                lineHeight: "1.2",
              }}
            >
              TECHNO COMMUNICATIONS LLC
            </p>
          </div>

          <div className="row justify-content-center align-items-center mt-5">
            <img
              loading="lazy"
              width="800"
              height="300"
              className="col-12 col-md-6 col-lg-4 mb-4 d-none d-sm-block h-50 me-5"
              srcSet="./logoT.webp"
              alt="Logo"
            />

            <div className="col-12 mt-5 col-md-6 col-lg-4 d-flex justify-content-center align-items-center">
              <form
                className="p-4 rounded shadow-lg w-100 col-12 bg-white"
                onSubmit={handleSubmit}
              >
                <h1 className="font-weight-bold d-flex justify-content-center fs-4 mb-4">
                  Login
                </h1>

                <div className="form-group mb-3">
                  <input
                    id="ntid"
                    type="text"
                    placeholder="Enter Email / NTID"
                    className="form-control border shadow-none"
                    ref={ntidRef}
                    aria-label="NTID"
                  />
                  {errors.ntid && (
                    <span className="text-danger small">{errors.ntid}</span>
                  )}
                </div>

                <div className="form-group mb-3 position-relative">
                  <input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter password"
                    className="form-control border shadow-none"
                    ref={passwordRef}
                    aria-label="Password"
                  />
                  <span
                    className="position-absolute top-50 end-0 translate-middle-y me-3"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    style={{ cursor: "pointer" }}
                  >
                    {passwordVisible ? <FaRegEye /> : <FaEyeSlash />}
                  </span>
                </div>
                {errors.password && (
                  <span className="text-danger small">{errors.password}</span>
                )}

                <div className="mb-3">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                </div>
                {errors.general && (
                  <p className="text-danger small text-center">
                    {errors.general}
                  </p>
                )}
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
