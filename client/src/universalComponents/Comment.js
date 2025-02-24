import React, { useRef } from "react";
import { TbSend2 } from "react-icons/tb";
import { Button } from "react-bootstrap";
import { RiImageAddFill } from "react-icons/ri";
import { ImCross } from "react-icons/im";

function Comment({
  handleCommentChange,
  handleSubmit,
  comment,
  commentLoading,
  selectedFiles,
  setSelectedFiles,
}) {
  const fileInputRef = useRef(null);

  // Handle file input click
  const handleUploadClick = () => fileInputRef.current?.click();

  // Add selected files
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  // Remove a specific file
  const removeFile = (index) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-100 d-flex flex-column border rounded mt-2 p-2"
    >
      <div className="d-flex align-items-center flex-wrap">
        {/* Add Image Button */}
        <RiImageAddFill
          className="fs-4 ms-2 ms-md-3"
          style={{ cursor: "pointer", color: "#E10174" }}
          onClick={handleUploadClick}
        />
        <input
          type="file"
          ref={fileInputRef}
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Comment Input */}
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Enter Comment"
          className="fw-medium rounded-3 border-0 bg-transparent flex-grow-1 mx-2"
          rows={1}
          style={{
            resize: "none",
            overflow: "hidden",
            outline: "none",
            boxShadow: "none",
            textAlign: "center",
            lineHeight: "1.5",
            minHeight: "50px",
            padding: "10px 5px",
            fontSize: "0.9rem", // Smaller font size for mobile
          }}
          required
          disabled={commentLoading}
        />

        {/* Submit Button */}
        {commentLoading ? (
          <div className="spinner-border text-primary"></div>
        ) : (
          <Button
            type="submit"
            className="bg-transparent text-primary border-0 d-flex align-items-center"
            style={{ minHeight: "50px" }}
          >
            <TbSend2 className="fs-3" />
          </Button>
        )}
      </div>

      {/* Display Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-2 ms-2">
          <strong>Selected Images:</strong>
          <ul className="list-unstyled">
            {selectedFiles.map((file, index) => (
              <li key={index} className="d-flex align-items-center text-muted">
                <span className="text-truncate" style={{ maxWidth: "150px" }}>
                  {file.name}
                </span>
                <Button
                  variant="link"
                  className="text-danger ms-2"
                  onClick={() => removeFile(index)}
                >
                  <ImCross className="text-danger" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

export default Comment;