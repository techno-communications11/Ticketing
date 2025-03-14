import React, { useState, useRef } from "react";
import { apiRequest } from "../lib/apiRequest";
import { FaRegEye, FaEyeSlash, FaUser, FaLock, FaUpload } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FileUploads from "../universalComponents/FileUploads";
import ReusableButtons from "../universalComponents/ReusableButtons";
import { Dropdown, Form } from "react-bootstrap";
import "../styles/Register.css"; // Updated custom CSS

export function Register() {
  const NTIDRef = useRef("");
  const fullNameRef = useRef("");
  const passwordRef = useRef("");
  const DoorCodeRef = useRef("");
  const fileInputRef = useRef(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSubRole, setSelectedSubRole] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeForm, setActiveForm] = useState("register");
  const [isNtidValid, setIsNtidValid] = useState(true);
  const [isFullnameValid, setIsFullnameValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isRoleValid, setIsRoleValid] = useState(true);
  const [loading, setLoading] = useState(false);

  const userRoles = [
    "Admin",
    "Market Manager",
    "SuperAdmin",
    "District Manager",
    "Employee",
    "Software India",
    "Internal",
    "Reporting",
    "Inventory",
    "Maintenance",
    "HR Payroll",
    "Commission",
  ];
  const subUserroles = ["Manager", "User"];

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSelect = (role) => {
    setSelectedRole(role);
    setSelectedSubRole("");
  };

  const handleSubSelect = (role) => {
    setSelectedSubRole(role);
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();

    const ntid = NTIDRef.current?.value?.trim().toLowerCase() || "";
    const fullname = fullNameRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value?.trim() || "";
    const DoorCode = DoorCodeRef.current?.value?.trim() || "";

    setIsNtidValid(!!ntid);
    setIsFullnameValid(!!fullname);
    setIsRoleValid(!!selectedRole);

    if (!validatePassword(password)) {
      setIsPasswordValid(false);
      toast.error("Password must meet the criteria.", { autoClose: 3000 });
      setLoading(false);
      return;
    }

    if (!ntid || !fullname || !selectedRole) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest.post("/auth/register", {
        ntid,
        fullname,
        DoorCode,
        selectedRole,
        selectedSubRole,
        password,
      });
      if (response.status === 201) {
        toast.success("Registered successfully", { autoClose: 2000 });
      } else {
        toast.error(response.data?.message || "Failed to register");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      resetForm();
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRole("");
    setSelectedSubRole("");
    if (NTIDRef.current) NTIDRef.current.value = "";
    if (fullNameRef.current) fullNameRef.current.value = "";
    if (DoorCodeRef.current) DoorCodeRef.current.value = "";
    if (passwordRef.current) passwordRef.current.value = "";
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await apiRequest.post("/auth/registeruser", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        setSelectedFile(null);
        toast.success("File uploaded successfully", { autoClose: 2000 });
      } else {
        toast.error("File upload failed. Please try again.", { autoClose: 2000 });
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordToggle = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-90 bg-light">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-8 col-lg-6">
          <ReusableButtons
            bigText="Register User"
            smallText="Upload"
            setActiveForm={setActiveForm}
            activeForm={activeForm}
          />
          {activeForm === "register" ? (
            <div className="card shadow-lg p-4 mt-4 border-0">
              <h2 className="text-center fw-bold mb-4" style={{ color: "#E10174" }}>
                Register User
              </h2>
              <Form onSubmit={handleSubmit}>
                {/* NTID Field */}
                <Form.Group className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-pink text-white">
                      <FaUser />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Enter Email / NTID"
                      className={`form-control ${!isNtidValid ? "is-invalid" : ""}`}
                      ref={NTIDRef}
                    />
                    {!isNtidValid && (
                      <Form.Control.Feedback type="invalid">
                        NTID is required.
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Full Name Field */}
                <Form.Group className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-pink text-white">
                      <FaUser />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Full Name"
                      className={`form-control ${!isFullnameValid ? "is-invalid" : ""}`}
                      ref={fullNameRef}
                    />
                    {!isFullnameValid && (
                      <Form.Control.Feedback type="invalid">
                        Full Name is required.
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Role Dropdown */}
                <Form.Group className="mb-3">
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="outline-pink"
                      className={`w-100 text-start ${!isRoleValid ? "border-danger" : ""}`}
                    >
                      {selectedRole || "Select Role"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100 shadow-sm" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {userRoles.map((role, index) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => handleSelect(role)}
                          className="dropdown-item-pink"
                        >
                          {role}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  {!isRoleValid && <small className="text-danger">Role is required.</small>}
                </Form.Group>

                {/* Subrole Dropdown */}
                {selectedRole &&
                  ["Admin", "Reporting", "Inventory", "Maintenance", "HR Payroll", "Commission"].includes(
                    selectedRole
                  ) && (
                    <Form.Group className="mb-3">
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-pink" className="w-100 text-start">
                          {selectedSubRole || "Select Subrole"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="w-100 shadow-sm">
                          {subUserroles.map((role, index) => (
                            <Dropdown.Item
                              key={index}
                              onClick={() => handleSubSelect(role)}
                              className="dropdown-item-pink"
                            >
                              {role}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </Form.Group>
                  )}

                {/* Door Code Field */}
                {["Employee", "Market Manager"].includes(selectedRole) && (
                  <Form.Group className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text bg-pink text-white">
                        <FaLock />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="Door Code"
                        className="form-control"
                        ref={DoorCodeRef}
                      />
                    </div>
                  </Form.Group>
                )}

                {/* Password Field */}
                <Form.Group className="mb-4">
                  <div className="input-group">
                    <span className="input-group-text bg-pink text-white">
                      <FaLock />
                    </span>
                    <Form.Control
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Password"
                      className={`form-control ${!isPasswordValid ? "is-invalid" : ""}`}
                      ref={passwordRef}
                    />
                    <span
                      className="input-group-text bg-pink text-white"
                      onClick={handlePasswordToggle}
                      style={{ cursor: "pointer" }}
                    >
                      {passwordVisible ? <FaRegEye /> : <FaEyeSlash />}
                    </span>
                    {!isPasswordValid && (
                      <Form.Control.Feedback type="invalid">
                        Password must be 8+ characters with uppercase, lowercase, number, and special character.
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Form.Group>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-pink w-100 py-2 fw-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    "Register"
                  )}
                </button>
              </Form>
            </div>
          ) : (
            <FileUploads
              handleFileUploadClick={handleFileUploadClick}
              handleFileChange={handleFileChange}
              handleFileUpload={handleFileUpload}
              selectedFile={selectedFile}
              fileInputRef={fileInputRef}
              loading={loading}
            />
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}

export default Register;