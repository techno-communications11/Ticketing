import React, { useState, useRef } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/loader.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileUploads from '../universalComponents/FileUploads';
import ReusableButtons from '../universalComponents/ReusableButtons';

export function Register() {
  const NTIDRef = useRef('');
  const fullNameRef = useRef('');
  const passwordRef = useRef('');
  const DoorCodeRef = useRef('');
  const fileInputRef = useRef(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectMarketValue, setSelectMarketValue] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeForm, setActiveForm] = useState('register');
  const [isNtidValid, setIsNtidValid] = useState(true);
  const [isFullnameValid, setIsFullnameValid] = useState(true);
  const [isDoorCodeValid, setIsDoorCodeValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isRoleValid, setIsRoleValid] = useState(true);

  const userRoles = [
    'Varun Team', 'NTID Mappings', 'Trainings', 'Accessories Order', 'YUBI Key Setups', 'Deposits', 'Charge Back', 'Commission',
    'Inventory', 'Head Office', 'Admin Related', 'Maintenance Related', 'Maintenance_Head', 'Housing Related', 'CAM NW', 'HR Payroll',
    'Reporting', 'Admin', 'Admin_Head', 'SuperAdmin', 'District Manager', 'Employee'
  ];

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ntid = NTIDRef.current.value;
    const fullname = fullNameRef.current.value;
    const password = passwordRef.current.value;
    const DoorCode = DoorCodeRef.current.value;

    setIsNtidValid(!!ntid);
    setIsFullnameValid(!!fullname);
    setIsDoorCodeValid(!!DoorCode);
    setIsRoleValid(!!selectedRole);
    if (!isFullnameValid || !isPasswordValid || isDoorCodeValid || !isRoleValid) {
      toast.error("enter details")
    }

    if (!validatePassword(password)) {
      setIsPasswordValid(false);
      toast.error("Password must contain at least 8 characters, including uppercase, lowercase, numeric, and special characters.", {
        autoClose: 3000,
      });
      return;
    } else {
      setIsPasswordValid(true);
    }

    if (!ntid || !fullname || !DoorCode || !selectedRole) {
      return;
    }

    try {
      const response = await apiRequest.post('/auth/register', { ntid, fullname, DoorCode, selectedRole, selectMarketValue, password });
      if (response.status === 201) {
        toast.success("Registered successfully", { autoClose: 2000 });
      } else {
        toast.error(response.data?.message || "Failed to register");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setSelectMarketValue('');
      setSelectedRole('');
    }
  };

  const handleFileUploadClick = () => { fileInputRef.current.click(); };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await apiRequest.post('/auth/registeruser', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setSelectedFile(null);
        toast.success("File uploaded successfully", { autoClose: 2000 });
      } else {
        toast.error("File upload failed. Please try again.", { autoClose: 2000 });
      }
    } catch (error) {
      // setError('An unexpected error occurred');
      toast.error("something went wrong ");
    }
  };
  const handlePasswordToggle = () => { setPasswordVisible(!passwordVisible); };
  const handleRoleChange = (e) => { setSelectedRole(e.target.value); };
  return (
    <div className="container">
      <div className="row align-items-center justify-content-center">
        <div className="col-12 col-md-6 col-lg-10">
          <ReusableButtons
            bigText={'Register User'}
            smallText={'Upload'}
            setActiveForm={setActiveForm}
            activeForm={activeForm}
          />
          {activeForm === 'register' ? (
            <div className="d-flex justify-content-center">
              <form onSubmit={handleSubmit} className="col-12 col-md-4 shadow-lg p-3 rounded">
                <h4 className="text-center font-family mb-2">Register User</h4>
                <div className="mb-2">
                  <input type="text"
                    id="ntid"
                    placeholder="NTID"
                    className={`fw-medium text-secondary form-control border shadow-none ${!isNtidValid ? 'input-error' : ''}`}
                    ref={NTIDRef} />
                </div>
                <div className="mb-2">
                  <input type="text"
                    id="fullName"
                    placeholder="Full Name"
                    className={`fw-medium text-secondary form-control border shadow-none ${!isFullnameValid ? 'input-error' : ''}`}
                    ref={fullNameRef} />
                </div>
                <div className="mb-2">
                  <input type="text"
                    id="doorCode"
                    placeholder="Door Code"
                    className={`fw-medium text-secondary form-control border shadow-none ${!isDoorCodeValid ? 'input-error' : ''}`}
                    ref={DoorCodeRef} />
                </div>
                <div className="mb-2">
                  <select id="role"
                    name="Select Role"
                    className={`form-select border shadow-none fw-medium text-secondary ${!isRoleValid ? 'input-error' : ''}`}
                    value={selectedRole}
                    onChange={handleRoleChange}>
                    <option value="" disabled>Select role</option>
                    {userRoles.sort().map((roles, index) => (
                      <option className="fw-medium text-primary"
                        key={index}
                        value={roles}>{roles}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <div className="input-group">
                    <input
                      id="password"
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="Password"
                      className="form-control border shadow-none fw-medium text-secondary"
                      ref={passwordRef}
                    />
                    <span className="input-group-text" onClick={handlePasswordToggle} style={{ cursor: 'pointer' }}>
                      {passwordVisible ? <FaRegEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-0">Register</button>
              </form>
              <img src="./register.webp" alt="register user" className="img-fluid d-none d-md-block mt-5 ms-5" style={{ maxHeight: '350px' }} />
            </div>
          ) : (
            <FileUploads
              handleFileUploadClick={handleFileUploadClick}
              handleFileChange={handleFileChange}
              handleFileUpload={handleFileUpload}
              handleSubmit={handleSubmit}
              selectedFile={selectedFile}
              fileInputRef={fileInputRef}
            />
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Register;
