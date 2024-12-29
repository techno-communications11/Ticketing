import React from "react";
import { MdOutlineCloudUpload } from "react-icons/md";

function FileUploads({
  fileInputRef,
  selectedFile,
  handleFileChange,
  handleFileUpload,
  handleFileUploadClick,
  loading
}) {
  return (
    <div className="row mt-5">
      <div className="col-12 col-md-6 order-md-2 d-flex justify-content-center align-items-center">
        <img
          src="../csv.png"
          alt="CSV illustration"
          className="img-fluid d-none d-md-block"
        />
      </div>
      <div className="col-12 col-md-6 order-md-1 mt-4 mt-md-0">
        <div className="bg-body shadow-lg rounded p-4">
          <h5 className="text-center fw-medium mb-4 font-family">Upload</h5>
          <h6 className="text-danger">
            Note<sup>*</sup>: Only CSV files can be uploaded.
          </h6>
          <div
            className="cursor-pointer  mb-2"
            style={{ height: "80px", cursor: "pointer", border: "1px dashed" }}
            onClick={handleFileUploadClick}
          >
            {!selectedFile ? (
              <div className=" mt-2 d-flex flex-column align-items-center justify-content-center m-0">
                <MdOutlineCloudUpload className=" text-secondary fs-1" />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".csv"
                />
                <p className="fw-medium text-secondary">Upload files</p>
              </div>
            ) : (
              <p className="text-secondary text-center mt-4 fw-medium">
                {selectedFile.name}
              </p>
            )}
          </div>
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary w-100"
              onClick={handleFileUpload}
            >
              {loading?<div class="spinner-border text-muted"></div>:'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUploads;
