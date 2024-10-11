import React, { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../lib/apiRequest';
import { MdOutlineCloudUpload } from "react-icons/md";
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/loader.css';
import getMarkets from '../universalComponents/GetMarkets';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Register() {
  const NTIDRef = useRef('');
  const fullNameRef = useRef('');
  const passwordRef = useRef('');
  const DoorCodeRef = useRef('');
  const fileInputRef = useRef(null);

  const [selectedRole, setSelectedRole] = useState('');
  // const [selectedMarket, setSelectedMarket] = useState([]);
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
  // const [selectedMarketError, setSelectedMarketError] = useState('');
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
    'Housing Related',
    'CAM NW',
    'HR Payroll',
    "Reporting",
    "Admin",
    "SuperAdmin",
    "District Manager",
    "Employee"

  ]

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await getMarkets();
  //       setSelectedMarket(data);
  //     } catch (error) {
  //       console.error('Error fetching market data:', error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setNtidError('');
    setFullnameError('');
    setPasswordError('');
    setSelectedRoleError('');
    // setSelectedMarketError('');
    setDoorCodeError('');

    const ntid = NTIDRef.current.value;
    const fullname = fullNameRef.current.value;
    const password = passwordRef.current.value;
    const DoorCode = DoorCodeRef.current.value;

    // const NTIDRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{3,16}$/;
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

    // if (!selectMarketValue) {
    //   setSelectedMarketError('Please select a market');
    //   hasError = true;
    // }

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
        console.log(response.status);
        toast.success("registered successfully", { autoClose: 3000 }); // 3 seconds

        // Handle successful registration (e.g., redirect or show success message)
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
      alert('Please select a file first.');
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
        console.log(response.message, "success");
        toast.success("File uploaded successfully", { autoClose: 3000 });
        // Handle successful file upload (e.g., show success message)
      } else {
        setError('File upload failed. Please try again.');
        toast.error("File upload failed. Please try again.", { autoClose: 3000 });
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

  const handleMarketChange = (e) => {
    setSelectMarketValue(e.target.value);
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
            <div className="d-flex justify-content-center gap-2 my-4">
              <button
                className={`btn ${activeForm === 'register' ? 'btn-success' : 'btn-danger'}`}
                onClick={() => setActiveForm('register')}
              >
                Register User
              </button>
              <button
                className={`btn ${activeForm === 'upload' ? 'btn-success' : 'btn-danger'}`}
                onClick={() => setActiveForm('upload')}
              >
                Upload
              </button>
            </div>
            {activeForm === 'register' ? (
              <div className='d-flex justify-content-center'>
                <form onSubmit={handleSubmit} className=' col-12 col-md-4 shadow-lg p-3 rounded'> {/* Reduced padding from p-4 to p-3 */}
                  <h4 className="text-center font-family mb-3">Register User</h4> {/* Reduced margin bottom */}

                  <div className="mb-3"> {/* Reduced margin bottom */}
                    <input type="text" id="ntid" placeholder="NTID" className="fw-medium text-secondary form-control border shadow-none" ref={NTIDRef} />
                    <span className="text-danger">{ntidError}</span>
                  </div>

                  <div className="mb-3"> {/* Reduced margin bottom */}
                    <input type="text" id="fullName" placeholder="Full Name" className=" fw-medium text-secondary form-control border shadow-none" ref={fullNameRef} />
                    <span className="text-danger">{fullnameError}</span>
                  </div>

                  <div className="mb-3"> {/* Reduced margin bottom */}
                    <input type="text" id="doorCode" placeholder="Door Code" className=" fw-medium text-secondary form-control border shadow-none" ref={DoorCodeRef} />
                    <span className="text-danger">{DoorCodeError}</span>
                  </div>

                  <div className="mb-3"> {/* Reduced margin bottom */}
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
              <div className="col-12 col-md-12  order-md-1 mt-5 mt-md-0">
                <div className="d-flex justify-content-center gap-5">
                  <div className="bg-body shadow-lg rounded p-4 ">
                    <h4 className="text-center fw-bold mb-4 font-family">Upload</h4>
                    <h6 className="text-danger">
                      Note<sup>*</sup>: Only CSV files can be uploaded.
                    </h6>
                    <div
                      className="cursor-pointer mb-2"
                      style={{ height: '80px', cursor: 'pointer', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={handleFileUploadClick}
                    >
                      {!selectedFile ? (
                        <div className=' mt-2 d-flex flex-column align-items-center justify-content-center m-0'>
                          <MdOutlineCloudUpload className="fs-1 text-secondary" />
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept=".csv"
                          />
                          <p className="fw-bolder text-secondary">Upload files</p>
                        </div>
                      ) : (
                        <p className="text-secondary mt-4 fw-bolder">{selectedFile.name}</p>
                      )}
                    </div>

                    <button
                      className="btn btn-primary w-100"
                      onClick={handleFileUpload}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  <img src="./csv.png" alt="csv" className='img-fluid d-none d-md-block' />

                  {error && <div className="text-danger mt-2">{error}</div>}
                </div>
              </div>

            )}
          </div>

        </div>

      )}
      <ToastContainer />
    </div>
  );
}

export default Register;
