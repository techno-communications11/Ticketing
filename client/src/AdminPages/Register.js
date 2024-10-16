import React, { useState, useRef, useEffect } from 'react';
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ntidError, setNtidError] = useState('');
  const [fullnameError, setFullnameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedRoleError, setSelectedRoleError] = useState('');
  const [DoorCodeError, setDoorCodeError] = useState('');
  const userRoles = [
    'Varun Team',
    'NTID Mappings',
    'Trainings',
    'Accessories Order',
    'YUBI Key Setups',
    'Deposits',
    'Charge Back',
    'Commission',
    'Inventory',
    'Head Office',
    'Admin Related',
    'Maintenance Related',
    'Maintenance_Head',
    'Housing Related',
    'CAM NW',
    'HR Payroll',
    "Reporting",
    "Admin",
    'Admin_Head',
    "SuperAdmin",
    "District Manager",
    "Employee"

  ]

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setNtidError('');
    setFullnameError('');
    setPasswordError('');
    setSelectedRoleError('');
    setDoorCodeError('');

    const ntid = NTIDRef.current.value;
    const fullname = fullNameRef.current.value;
    const password = passwordRef.current.value;
    const DoorCode = DoorCodeRef.current.value;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

    let hasError = false;
    if (!ntid) {
      setNtidError('NTID is required');
      hasError = true;
    } 

    if (!fullname) {
      setFullnameError('Full name is required');
      hasError = true;
    }

    if (!DoorCode) {
      setDoorCodeError('Door code is required');
      hasError = true;
    }

    if (!passwordRegex.test(password)) {
      setPasswordError('Invalid password');
      hasError = true;
    }

    if (!selectedRole) {
      setSelectedRoleError('Please select a role');
      hasError = true;
    }

    if (hasError) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest.post('/auth/register', {
        ntid,
        fullname,
        DoorCode,
        selectedRole,
        selectMarketValue,
        password
      });

      if (response.status === 201) {
        toast.success("registered successfully", { autoClose: 2000 }); 
      } else {
        toast.error(error.response?.data?.message || "failed to register");
        setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setSelectMarketValue('');
      setSelectedRole('');
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
      toast.error('Please select a file first.');
      return;
    }

    setIsLoading(true);
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
        setError('File upload failed. Please try again.');
        toast.error("File upload failed. Please try again.", { autoClose: 2000 });
      }
    } catch (error) {
      setError('An unexpected error occurred');
      toast.error("something went wrong ");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordToggle = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  return (
    <div className="container">
      {isLoading ? (
        <div >
          <div className='loader d-flex align-items-center justify-content-center'></div>
        </div>
      ) : (
        <div className="row align-items-center justify-content-center">
          <div className="col-12 col-md-12 col-lg-12 ">
            <ReusableButtons bigText={'Register User'}
             smallText={'Upload'} 
             setActiveForm={setActiveForm} 
             activeForm={activeForm}/>
            {activeForm === 'register' ? (
              <div className='d-flex justify-content-center'>
                <form onSubmit={handleSubmit} className=' col-12 col-md-4 shadow-lg p-3 rounded'> 
                  <h4 className="text-center font-family mb-3">Register User</h4> 

                  <div className="mb-3"> 
                    <input type="text" id="ntid" placeholder="NTID" className="fw-medium text-secondary form-control border shadow-none" ref={NTIDRef} />
                    <span className="text-danger">{ntidError}</span>
                  </div>

                  <div className="mb-3"> 
                    <input type="text" id="fullName" placeholder="Full Name" className=" fw-medium text-secondary form-control border shadow-none" ref={fullNameRef} />
                    <span className="text-danger">{fullnameError}</span>
                  </div>

                  <div className="mb-3"> 
                    <input type="text" id="doorCode" placeholder="Door Code" className=" fw-medium text-secondary form-control border shadow-none" ref={DoorCodeRef} />
                    <span className="text-danger">{DoorCodeError}</span>
                  </div>

                  <div className="mb-3"> 
                    <select id="role" name="Select Role" className="form-select border shadow-none fw-medium text-secondary" value={selectedRole} onChange={handleRoleChange}>
                      <option value="" disabled>Select role</option>
                      {
                        userRoles.sort().map((roles, index) => (
                          <option className='fw-medium text-primary' key={index} value={roles}>{roles}</option>
                        ))
                      }
                    </select>
                    <span className="text-danger">{selectedRoleError}</span>
                  </div>

                  <div className="mb-4 ">
                    <div className="input-group ">
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
                    <span className="text-danger">{passwordError}</span>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mb-0">Register</button>
                </form>

                <img src="./register.webp" alt="register user" className="img-fluid d-none d-md-block mt-5 ms-5" style={{ maxHeight: '350px' }} /> {/* Added max height for the image */}
              </div>


            ) : (
              <FileUploads
                handleFileUploadClick={handleFileUploadClick}
                handleFileChange={handleFileChange}
                handleFileUpload={handleFileUpload}
                handleSubmit={handleSubmit}
                selectedFile={selectedFile}
                fileInputRef={fileInputRef}
                isLoading={isLoading} />

            )}
          </div>

        </div>

      )}
      <ToastContainer />
    </div>
  );
}

export default Register;
