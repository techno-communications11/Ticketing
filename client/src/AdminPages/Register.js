import React, { useState, useRef } from "react";
import { apiRequest } from "../lib/apiRequest";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import "../styles/loader.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FileUploads from "../universalComponents/FileUploads";
import ReusableButtons from "../universalComponents/ReusableButtons";
import { Dropdown } from "react-bootstrap";

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
  
    const ntid = NTIDRef.current?.value?.trim() || "";
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
    <div className="container mt-5">
      <div className="row align-items-center justify-content-center">
        <div className="col-12 col-md-6 col-lg-10">
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
                className="col-12 col-md-4 shadow-lg p-3 rounded"
              >
                <h4 className="text-center font-family mb-2">Register User</h4>
                <input
                  type="text"
                  id="ntid"
                  placeholder="NTID or Email"
                  className={`form-control my-1 ${
                    !isNtidValid ? "input-error" : ""
                  }`}
                  ref={NTIDRef}
                />
                <input
                  type="text"
                  id="fullName"
                  placeholder="Full Name"
                  className={`form-control my-1 ${
                    !isFullnameValid ? "input-error" : ""
                  }`}
                  ref={fullNameRef}
                />

                <Dropdown>
                  <Dropdown.Toggle
                    id="roleDropdown"
                    className={`form-control bg-transparent text-dark text-start border-secondary shadow-none my-1 ${
                      !isRoleValid ? "input-error" : ""
                    }`}
                  >
                    {selectedRole || "Select Role"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {userRoles.map((role, index) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => handleSelect(role)}
                      >
                        {role}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
                {selectedRole && ["Admin"].includes(selectedRole) && (
                  <Dropdown>
                    <Dropdown.Toggle
                      id="subRoleDropdown"
                      className="form-control bg-transparent text-dark text-start border-secondary "
                    >
                      {selectedSubRole || "Select Subrole"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {subUserroles.map((role, index) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => handleSubSelect(role)}
                        >
                          {role}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}

               {["Employee","Market Manager"].includes(selectedRole) && <input
                  type="text"
                  id="doorCode"
                  placeholder="Door Code"
                  className="form-control my-1"
                  ref={DoorCodeRef}
                />}
                <div className="input-group">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Password"
                    className="form-control my-1"
                    ref={passwordRef}
                  />
                  <span
                    className="input-group-text"
                    onClick={handlePasswordToggle}
                    style={{cursor:'pointer'}}
                  >
                    {passwordVisible ? <FaRegEye /> : <FaEyeSlash />}
                  </span>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  {loading ? (
                    <div class="spinner-border text-muted"></div>
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
