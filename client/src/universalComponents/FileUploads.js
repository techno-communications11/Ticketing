import React from "react";
import { MdOutlineCloudUpload } from "react-icons/md";
import { Card, Button } from "react-bootstrap";
import "../styles/FileUploads.css"; // New custom CSS file

function FileUploads({
  fileInputRef,
  selectedFile,
  handleFileChange,
  handleFileUpload,
  handleFileUploadClick,
  loading,
}) {
  return (
    <div className="row justify-content-center mt-5">
      {/* Image Section */}
      <div className="col-12 col-md-6 order-md-2 d-flex justify-content-center align-items-center">
        <img
          src="../csv.png"
          alt="CSV illustration"
          className="img-fluid d-none d-md-block"
          style={{ maxHeight: "300px" }}
        />
      </div>

      {/* Upload Form Section */}
      <div className="col-12 col-md-6 order-md-1 mt-4 mt-md-0">
        <Card className="shadow-lg p-4 border-0 upload-card">
          <h5 className="text-center fw-bold mb-4" style={{ color: "#E10174" }}>
            Upload CSV
          </h5>
          <p className="text-danger mb-3">
            Note<sup>*</sup>: Only CSV files can be uploaded.
          </p>
          <div
            className="upload-area mb-3 d-flex align-items-center justify-content-center"
            onClick={handleFileUploadClick}
          >
            {!selectedFile ? (
              <div className="text-center">
                <MdOutlineCloudUpload className="text-pink fs-1 mb-2" />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".csv"
                />
                <p className="fw-medium text-muted mb-0">Upload files</p>
              </div>
            ) : (
              <p className="text-muted text-center fw-medium mb-0">
                {selectedFile.name}
              </p>
            )}
          </div>
          <Button
            variant="pink"
            className="w-100 py-2 fw-medium"
            onClick={handleFileUpload}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              "Upload"
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default FileUploads;