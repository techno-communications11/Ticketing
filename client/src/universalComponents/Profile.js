import React, { useState, useEffect, useRef } from "react";
import { MdOutlineCloudUpload, MdModeEditOutline } from "react-icons/md";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { apiRequest } from "../lib/apiRequest";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [error, setError] = useState("");
  const [photoUpdated, setPhotoUpdated] = useState(false);
  const fetchUserData = async () => {
    try {
      const response = await apiRequest.get("/profile/getprofiledata_token");
      if (response.status === 200) {
        setUserData(response.data);
        console.log(response.data,'dattat')
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err.message);
      setError(err.message);
    }
  };
  const fetchProfile = async () => {
    try {
      const response = await apiRequest.get("/profile/getprofilephoto", {
        withCredentials: true,
      });
      if (response.status === 200) {
        const imageUrl = response.data.fileUrl; // This is a signed URL
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

  console.log("Uploading file:", file);
    try {
      await apiRequest.post("/profile/profilephoto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      toast.success("Profile photo added successfully!");
      setTimeout(() => {
        window.location.reload();
      }, [2000]);
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

  const handleEdit = async () => {
    setImmediateEdit(true);
    setPopButtons(false);
    setUploadedFileUrl(null);
  };

  const resetPasswordHandler = () => setToggle(true);
  const handlePasswordToggle = () => setPasswordVisibleNew((prev) => !prev);
  const handlePasswordConfirmToggle = () =>
    setPasswordConfirmVisible((prev) => !prev);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const password = passwordRef.current.value;
    const confirmPassword = passwordConformRef.current.value;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    setError("");

    if (password.length === 0) {
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
  console.log(uploadedFileUrl, "uploadedfileurl");

  return (
    <div className="container  mt-sm-5 mt-md-1">
      <div className=" d-md-flex flex-row justify-content-center align-items-start">
        <div className="d-none d-md-flex  align-items-center m-auto">
          <img src="./userdata.png" height={300} />
        </div>

        <div className="col-md-6">
          <div className="d-flex flex-column justify-content-center align-items-center">
            {uploadedFileUrl == null ? (
              <div
                className="d-flex flex-column justify-content-center align-items-center  rounded-circle"
                onClick={() => setPopButtons(true)}
                style={{ cursor: "pointer", width: "10vw", height: "19vh" }}
              >
                {popButtons || ImmediateEdit ? (
                  <div className="mt-2">
                    <label className="btn btn-outline-secondary fw-medium m-1 font-size">
                      Camera
                      <input
                        type="file"
                        accept="image/*" // Accept any image type for compatibility
                        capture="environment" // Use the back camera if supported
                        style={{ display: "none" }}
                        onChange={handleFileInputChange}
                      />
                    </label>

                    <label className="btn btn-outline-secondary fw-medium font-size ms-2">
                      Browse
                      <input
                        type="file"
                        accept=".jpeg, .jpg, .png, .gif"
                        style={{ display: "none" }}
                        onChange={handleFileInputChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <MdOutlineCloudUpload size={50} className="ms-4" />
                    <p className="text-secondary me-2">Upload Photo</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2">
                <img
                  src={uploadedFileUrl}
                  alt="Profile"
                  className="img-thumbnail rounded-circle"
                  style={{ width: "100px", height: "100px" }}
                />
                <div className="ms-3 mt-2 fs-6 ">
                  <span
                    style={{ cursor: "pointer" }}
                    className="btn btn-outline-primary fs-6"
                    onClick={handleEdit}
                  >
                    <MdModeEditOutline /> Edit
                  </span>
                </div>
              </div>
            )}
          </div>

          {userData && (
            <div className=" p-1">
              <div>
                {Object.entries(userData).map(([key, value]) => (
                  <p key={key} className="d-flex justify-content-between">
                    <strong>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </strong>
                    <span>{value}</span>
                  </p>
                ))}
              </div>

              {toggle === false ? (
                <button
                  className="btn btn-primary  w-100"
                  onClick={resetPasswordHandler}
                >
                  Reset Password
                </button>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group d-flex align-items-center border rounded">
                    <input
                      type={passwordVisibleNew ? "text" : "password"}
                      placeholder="Enter password"
                      className="form-control border-0 shadow-none"
                      ref={passwordRef}
                    />
                    <span
                      onClick={handlePasswordToggle}
                      className="mx-2"
                      style={{ cursor: "pointer" }}
                    >
                      {passwordVisibleNew ? <FaRegEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  <div className="form-group d-flex align-items-center mt-1 border rounded">
                    <input
                      type={passwordVisibleConfirm ? "text" : "password"}
                      placeholder="Confirm password"
                      className="form-control border-0 shadow-none"
                      ref={passwordConformRef}
                    />
                    <span
                      onClick={handlePasswordConfirmToggle}
                      className="mx-2"
                      style={{ cursor: "pointer" }}
                    >
                      {passwordVisibleConfirm ? <FaRegEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  {error && <small className="text-danger">{error}</small>}
                  <button type="submit" className="btn btn-primary mt-2 w-100">
                    Update Password
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
