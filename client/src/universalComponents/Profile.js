import React, { useState, useEffect, useRef } from "react";
import { MdOutlineCloudUpload, MdModeEditOutline } from "react-icons/md";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { apiRequest } from "../lib/apiRequest";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Profile.css"; // New custom stylesheet

export function Profile() {
  const [popButtons, setPopButtons] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [immediateEdit, setImmediateEdit] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [passwordVisibleNew, setPasswordVisibleNew] = useState(false);
  const [passwordVisibleConfirm, setPasswordConfirmVisible] = useState(false);
  const passwordRef = useRef(null);
  const passwordConformRef = useRef(null);
  const [error, setError] = useState("");
  const [photoUpdated, setPhotoUpdated] = useState(false);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await apiRequest.get("/profile/getprofiledata_token");
      if (response.status === 200) {
        setUserData(response.data);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err.message);
      setError(err.message);
    }
  };

  // Fetch profile photo
  const fetchProfile = async () => {
    try {
      const response = await apiRequest.get("/profile/getprofilephoto", {
        withCredentials: true,
      });
      if (response.status === 200) {
        const imageUrl = response.data.fileUrl;
        setUploadedFileUrl(imageUrl);
      } else {
        throw new Error("Failed to retrieve profile photo");
      }
    } catch (error) {
      console.error("Error retrieving file:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchProfile();
  }, [photoUpdated]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      await apiRequest.post("/profile/profilephoto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      toast.success("Profile photo added successfully!");
      setTimeout(() => {
        fetchProfile();
        setPhotoUpdated(!photoUpdated); // Trigger re-fetch
      }, 2000);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error adding profile photo");
    }
  };

  const handleFileInputChange = (event) => {
    if (event.target.files.length > 0) {
      handleFileChange(event);
    }
  };

  const handleEdit = () => {
    setImmediateEdit(true);
    setPopButtons(false);
    setUploadedFileUrl(null);
  };

  const resetPasswordHandler = () => setToggle(true);
  const handlePasswordToggle = () => setPasswordVisibleNew((prev) => !prev);
  const handlePasswordConfirmToggle = () => setPasswordConfirmVisible((prev) => !prev);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const password = passwordRef.current.value;
    const confirmPassword = passwordConformRef.current.value;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    setError("");

    if (!password || !confirmPassword) {
      setError("Password fields are empty");
    } else if (!passwordRegex.test(password)) {
      setError("Use a strong password");
    } else if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      try {
        const response = await apiRequest.put(
          "/auth/resetpassword",
          { password },
          { withCredentials: true }
        );
        if (response.status === 200) {
          setToggle(false);
          toast.success("Password updated successfully!");
        }
      } catch (error) {
        console.error("Error resetting password:", error);
        toast.error("Error updating password");
      }
    }
  };

  return (
    <div className="container-fluid  mt-4">
      <div className="row justify-content-center align-items-start">
        {/* Left Side Image (Hidden on Small Screens) */}
        <div className="col-md-4 mt-5 d-none d-md-flex align-items-center justify-content-center">
          <img src="./userdata.png" alt="User Data" className="img-fluid profile-side-image" />
        </div>

        {/* Profile Content */}
        <div className="col-md-6 mt-5">
          <div className="card shadow-sm profile-card">
            <div className="card-body text-center">
              {/* Profile Photo Section */}
              <div className="profile-photo-wrapper mb-4">
                {uploadedFileUrl == null ? (
                  <div
                    className="photo-upload-area rounded-circle bg-light d-flex flex-column justify-content-center align-items-center"
                    onClick={() => setPopButtons(true)}
                  >
                    {popButtons || immediateEdit ? (
                      <div className="upload-buttons">
                        <label className="btn btn-outline-pink fw-medium m-1">
                          Camera
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="d-none"
                            onChange={handleFileInputChange}
                          />
                        </label>
                        <label className="btn btn-outline-pink fw-medium m-1">
                          Browse
                          <input
                            type="file"
                            accept=".jpeg, .jpg, .png, .gif"
                            className="d-none"
                            onChange={handleFileInputChange}
                          />
                        </label>
                      </div>
                    ) : (
                      <div>
                        <MdOutlineCloudUpload size={50} className="text-pink" />
                        <p className="text-muted mt-2">Upload Photo</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="profile-photo-display">
                    <img
                      src={uploadedFileUrl}
                      alt="Profile"
                      className="rounded-circle img-thumbnail"
                    />
                    <button
                      className="btn btn-outline-pink mt-2 ms-3"
                      onClick={handleEdit}
                    >
                      <MdModeEditOutline /> Edit
                    </button>
                  </div>
                )}
              </div>

              {/* User Data Section */}
              {userData && (
                <div className="user-data">
                  {Object.entries(userData).map(([key, value]) => (
                    <div
                      key={key}
                      className="d-flex justify-content-between align-items-center mb-2"
                    >
                      <strong className="text-pink text-capitalize">
                        {key}:
                      </strong>
                      <span>{value}</span>
                    </div>
                  ))}

                  {/* Reset Password Section */}
                  {!toggle ? (
                    <button
                      className="btn btn-pink w-100 mt-3"
                      onClick={resetPasswordHandler}
                    >
                      Reset Password
                    </button>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="input-group mb-2">
                        <input
                          type={passwordVisibleNew ? "text" : "password"}
                          placeholder="Enter new password"
                          className="form-control border-pink"
                          ref={passwordRef}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-pink"
                          onClick={handlePasswordToggle}
                        >
                          {passwordVisibleNew ? <FaRegEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                      <div className="input-group mb-2">
                        <input
                          type={passwordVisibleConfirm ? "text" : "password"}
                          placeholder="Confirm password"
                          className="form-control border-pink"
                          ref={passwordConformRef}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-pink"
                          onClick={handlePasswordConfirmToggle}
                        >
                          {passwordVisibleConfirm ? <FaRegEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                      {error && <small className="text-danger d-block mb-2">{error}</small>}
                      <button type="submit" className="btn btn-pink w-100">
                        Update Password
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}

export default Profile;