import React, { useState, useRef } from "react";
import { apiRequest } from "../lib/apiRequest";
import { FaRegEye, FaEyeSlash, FaUser, FaLock, FaUpload } from "react-icons/fa"; // React Icons
import "../styles/loader.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FileUploads from "../universalComponents/FileUploads";
import ReusableButtons from "../universalComponents/ReusableButtons";
import { Dropdown } from "react-bootstrap";
import "../styles/Register.css"; // Custom CSS for styling

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
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSelect = (role) => {
    setSelectedRole(role);
    setSelectedSubRole(""); // Reset subrole when changing role
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

    // Validation
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
    if (NTIDRef.current && NTIDRef.current.value !== undefined) {
      NTIDRef.current.value = "";
    }
    if (fullNameRef.current && fullNameRef.current.value !== undefined) {
      fullNameRef.current.value = "";
    }
    if (DoorCodeRef.current && DoorCodeRef.current.value !== undefined) {
      DoorCodeRef.current.value = "";
    }
    if (passwordRef.current && passwordRef.current.value !== undefined) {
      passwordRef.current.value = "";
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
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
        toast.error("File upload failed. Please try again.", {
          autoClose: 2000,
        });
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
    <div style={{minHeight:'39rem'}} className="container-fluid d-flex flex-column align-items-center justify-content-center">
      <div className="row justify-content-center align-items-center w-100">
        <div className="col-12 col-md-8 col-lg-6">
          <ReusableButtons
            bigText="Register User"
            smallText="Upload"
            setActiveForm={setActiveForm}
            activeForm={activeForm}
          />
          {activeForm === "register" ? (
            <div className="d-flex justify-content-center mt-5 h-auto">
              <form
                onSubmit={handleSubmit}
                className="col-12 col-md-8 shadow-lg p-4 rounded bg-white"
              >
                <h2 className="text-center font-weight-bold mb-4 text-pink">
                  Register User
                </h2>
                <div className="form-group mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-pink text-white">
                      <FaUser />
                    </span>
                    <input
                      type="text"
                      id="ntid"
                      placeholder="Enter Email / NTID"
                      className={`form-control ${
                        !isNtidValid ? "input-error" : ""
                      }`}
                      ref={NTIDRef}
                    />
                  </div>
                  {!isNtidValid && (
                    <span className="text-danger small">NTID is required.</span>
                  )}
                </div>

                <div className="form-group mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-pink text-white">
                      <FaUser />
                    </span>
                    <input
                      type="text"
                      id="fullName"
                      placeholder="Full Name"
                      className={`form-control ${
                        !isFullnameValid ? "input-error" : ""
                      }`}
                      ref={fullNameRef}
                    />
                  </div>
                  {!isFullnameValid && (
                    <span className="text-danger small">
                      Full Name is required.
                    </span>
                  )}
                </div>

                <div className="form-group mb-3">
                  <Dropdown>
                    <Dropdown.Toggle
                      id="roleDropdown"
                      className={`form-control bg-transparent text-dark text-start border-secondary ${
                        !isRoleValid ? "input-error" : ""
                      }`}
                    >
                      {selectedRole || "Select Role"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      style={{ overflowY: "auto", height: "300px" }}
                    >
                      {userRoles.map((role, index) => (
                        <Dropdown.Item
                          className="shadow-lg text-primary"
                          key={index}
                          onClick={() => handleSelect(role)}
                        >
                          {role}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  {!isRoleValid && (
                    <span className="text-danger small">
                      Role is required.
                    </span>
                  )}
                </div>

                {selectedRole &&
                  [
                    "Admin",
                    "Reporting",
                    "Inventory",
                    "Maintenance",
                    "HR Payroll",
                    "Commission",
                  ].includes(selectedRole) && (
                    <div className="form-group mb-3">
                      <Dropdown>
                        <Dropdown.Toggle
                          id="subRoleDropdown"
                          className="form-control bg-transparent text-dark text-start border-secondary"
                        >
                          {selectedSubRole || "Select Subrole"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {subUserroles.map((role, index) => (
                            <Dropdown.Item
                              className="shadow-lg text-primary"
                              key={index}
                              onClick={() => handleSubSelect(role)}
                            >
                              {role}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  )}

                {["Employee", "Market Manager"].includes(selectedRole) && (
                  <div className="form-group mb-3">
                    <div className="input-group">
                      <span className="input-group-text bg-pink text-white">
                        <FaLock />
                      </span>
                      <input
                        type="text"
                        id="doorCode"
                        placeholder="Door Code"
                        className="form-control"
                        ref={DoorCodeRef}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-pink text-white">
                      <FaLock />
                    </span>
                    <input
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Password"
                      className="form-control"
                      ref={passwordRef}
                    />
                    <span
                      className="input-group-text bg-pink text-white"
                      onClick={handlePasswordToggle}
                      style={{ cursor: "pointer" }}
                    >
                      {passwordVisible ? <FaRegEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  {!isPasswordValid && (
                    <span className="text-danger small">
                      Password must meet the criteria.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-pink w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner-border text-light"></div>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>

              <img
                src="./register.webp"
                alt="register user"
                className="img-fluid d-none d-md-block mt-5 ms-5"
                style={{ maxHeight: "350px" }}
              />
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
      <ToastContainer />
    </div>
  );
}

export default Register;