import React, { useState, useEffect, useRef } from 'react';
import { MdOutlineCloudUpload, MdModeEditOutline } from 'react-icons/md';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';
import { apiRequest } from '../lib/apiRequest';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function Profile() {
  const [popButtons, setPopButtons] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [ImmediateEdit, setImmediateEdit] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [passwordVisibleNew, setPasswordVisibleNew] = useState(false);
  const [passwordVisibleConfirm, setPasswordConfirmVisible] = useState(false);
  const passwordRef = useRef(null);
  const passwordConformRef = useRef(null);
  const [error, setError] = useState('');
  const [photoUpdated, setPhotoUpdated] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiRequest.get('/profile/getprofiledata_token');
        if (response.status === 200) {
          setUserData(response.data);
        } else {
          throw new Error('Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err.message);
        setError(err.message);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await apiRequest.get('/profile/getprofilephoto', {
          withCredentials: true
        });

        if (response.status === 200) {
          const fileName = response.data.path;
          const baseURL = 'http://localhost:4000';
          const imageUrl = `${baseURL}/public/images/${fileName}`;
          setUploadedFileUrl(imageUrl);
        } else {
          throw new Error('Failed to retrieve profile photo');
        }
      } catch (error) {
        console.error('Error retrieving file:', error);
      }
    };

    fetchUserData();
    fetchProfile();
  }, [photoUpdated]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      await apiRequest.post('/profile/profilephoto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      toast.success('Profile photo added successfully!'); // Toast notification for adding photo
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error adding profile photo');
    }
  };

  const handleFileChangeUpdate = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      await apiRequest.put('/profile/updateprofilephoto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      setPhotoUpdated(prev => !prev);
      toast.success('Profile photo updated successfully!'); // Toast notification for updating photo
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error updating profile photo');
    }
  };

  const handleFileInputChange = (event) => {
    if (event.target.files.length > 0) {
      handleFileChange(event);
      handleFileChangeUpdate(event);
    }
  };

  const handleEdit = async (event) => {
    setImmediateEdit(true);
    setPopButtons(false);
    setUploadedFileUrl(null);
  };

  const resetPasswordHandler = () => {
    setToggle(true);
  };

  const handlePasswordToggle = () => {
    setPasswordVisibleNew(!passwordVisibleNew);
  };

  const handlePasswordConfirmToggle = () => {
    setPasswordConfirmVisible(!passwordVisibleConfirm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const password = passwordRef.current.value;
    const confirmPassword = passwordConformRef.current.value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    setError('');

    if (password.length === 0) {
      setError('Password fields are empty');
    } else if (!passwordRegex.test(password)) {
      setError('Use a strong password');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      try {
        const response = await apiRequest.put('/auth/resetpassword', { password }, { withCredentials: true });
        if (response.status === 200) {
          setToggle(false);
          toast.success("Password updated successfully!"); // Toast notification for password update
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        toast.error('Error updating password');
      }
    }
  };

  return (
    <div className="container mt-5 d-flex flex-column flex-md-row justify-content-center align-items-center">
      <div className="d-none d-md-flex flex-column align-items-center me-5">
        <img src='./userdata.png' height={300} />
      </div>

      <div className="w-100 border p-3 rounded">
        <div className="card-body text-center">
          <div className="d-flex flex-column justify-content-center align-items-center my-3">
            {uploadedFileUrl == null ? (
              <div
                className='d-flex flex-column justify-content-center align-items-center border rounded-circle p-2'
                onClick={() => setPopButtons(true)}
                style={{ cursor: 'pointer', width: '10vw', height: '19vh' }}>
                {popButtons || ImmediateEdit ? (
                  <div className='mt-3'>
                    <label className='btn btn-outline-secondary fw-bolder m-1 font-size'>
                      Camera
                      <input
                        type='file'
                        accept=".jpeg, .jpg, .png, .gif"
                        capture='environment'
                        style={{ display: 'none' }}
                        onChange={handleFileInputChange}
                      />
                    </label>
                    <label className='btn btn-outline-secondary fw-bolder font-size'>
                      Browse
                      <input
                        type='file'
                        accept=".jpeg, .jpg, .png, .gif"
                        style={{ display: 'none' }}
                        onChange={handleFileInputChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <MdOutlineCloudUpload className='upload-image-style' size={50} />
                    <p className='fw-bolder text-secondary'>Upload Photo</p>
                  </div>
                )}
              </div>
            ) : (
              uploadedFileUrl && (
                <>
                  <div className="mt-3 text-center">
                    <img src={uploadedFileUrl} alt="Selected" className="img-thumbnail rounded-circle" style={{ width: '100px', height: '100px' }} />
                  </div>
                  <div>
                    <span className='mt-5' style={{ cursor: 'pointer' }} onClick={handleEdit}>
                      <MdModeEditOutline />
                    </span>
                  </div>
                </>
              )
            )}
          </div>  

          {userData && (
            <div className='profile-data'>
              <div className=" col-12 d-flex flex-column my-3 mx-auto w-50">
                <p className="card-text d-flex justify-content-between">
                  <strong>NTID:</strong> 
                  <span>{userData.ntid}</span>
                </p>
                <p className="card-text d-flex justify-content-between">
                  <strong>FullName:</strong> 
                  <span>{userData.fullname}</span>
                </p>
                <p className="card-text d-flex justify-content-between">
                  <strong>Market:</strong> 
                  <span>{userData.market}</span>
                </p>
                <p className="card-text d-flex justify-content-between">
                  <strong>DmName:</strong> 
                  <span>{userData.dmName}</span>
                </p>
                <p className="card-text d-flex justify-content-between">
                  <strong>DoorCode:</strong> 
                  <span>{userData.DoorCode}</span>
                </p>
                <p className="card-text d-flex justify-content-between">
                  <strong>department:</strong> 
                  <span>{userData.departmentName}</span>
                </p>
              </div>
              {toggle === false ? (
                <button className="btn btn-primary w-50" onClick={resetPasswordHandler}>Reset Password</button>
              ) : (
                <form className='col-12 reset-password-form mx-auto d-flex flex-column gap-2 w-50  mt-3' onSubmit={handleSubmit}>
                  <div className='d-flex form-group border rounded'>
                    <input type={passwordVisibleNew ? 'text' : 'password'} placeholder='Enter password' className='form-control border-0 shadow-none' ref={passwordRef} />
                    <span className='mx-2 mt-1' onClick={handlePasswordToggle} style={{ cursor: 'pointer' }}>
                      {passwordVisibleNew ? <FaRegEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  <div className='d-flex form-group border rounded'>
                    <input type={passwordVisibleConfirm ? 'text' : 'password'} placeholder='Confirm password' className='form-control border-0 shadow-none' ref={passwordConformRef} />
                    <span className='mx-2 mt-1' onClick={handlePasswordConfirmToggle} style={{ cursor: 'pointer' }}>
                      {passwordVisibleConfirm ? <FaRegEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  <button type='submit' className='btn btn-primary mt-3'>reset</button>
                </form>
              )}
              {error && <p className="text-danger">{error}</p>}
            </div>
          )}
        </div>
      </div>
      <ToastContainer /> {/* Toast container for notifications */}
    </div>
  );
}
