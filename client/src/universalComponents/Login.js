import React, { useState, useRef, useCallback, useEffect } from "react";
import { FaRegEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import { apiRequest } from "../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "animate.css";
import { Form, Button } from "react-bootstrap";
import "../styles/Login.css"; // Updated custom CSS

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
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-pink-light">
      {isLoading ? (
        <div className="d-flex align-items-center justify-content-center vh-100">
          <div className="spinner-border text-pink" role="status" style={{ width: "3rem", height: "3rem" }}>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center align-items-center w-100">
           <h1 className="display-6 text-center fw-bold mb-5 text-dark">Welcome Back ..</h1>
          {/* Left Side: Logo */}
          <div className="col-12 col-md-6 d-flex justify-content-center align-items-center animate__animated animate__fadeInLeft">
            <img
              loading="lazy"
              width="500"
              height="300"
              className="img-fluid"
              src="./logoT.webp"
              alt="Logo"
            />
          </div>

          {/* Right Side: Login Form */}
          <div className="col-12 col-md-6 d-flex justify-content-center align-items-center animate__animated animate__fadeInRight">
            <div className="card shadow-lg p-4 border-0 w-100" style={{ maxWidth: "500px" }}>
              <h1 className="text-center fw-bold mb-4 text-pink" style={{color:'#E10174'}}>Login</h1>
             
              <Form onSubmit={handleSubmit}>
                {/* NTID Input */}
                <Form.Group className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-pink text-white">
                      <FaUser />
                    </span>
                    <Form.Control
                      id="ntid"
                      type="text"
                      placeholder="Enter Email / NTID"
                      className="form-control-modern shadow-none"
                      ref={ntidRef}
                      isInvalid={!!errors.ntid}
                      aria-label="NTID"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.ntid}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                {/* Password Input */}
                <Form.Group className="mb-4">
                  <div className="input-group">
                    <span className="input-group-text bg-pink text-white">
                      <FaLock />
                    </span>
                    <Form.Control
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Enter password"
                      className="form-control-modern shadow-none"
                      ref={passwordRef}
                      isInvalid={!!errors.password}
                      aria-label="Password"
                    />
                    <span
                      className="input-group-text bg-pink text-white"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      style={{ cursor: "pointer" }}
                    >
                      {passwordVisible ? <FaRegEye /> : <FaEyeSlash />}
                    </span>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                {/* Submit Button */}
                <Button
                  variant="pink"
                  type="submit"
                  className="w-100 py-2 fw-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    "Login"
                  )}
                </Button>

                {/* Error Message */}
                {errors.general && (
                  <p className="text-danger small text-center mt-3">{errors.general}</p>
                )}
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;