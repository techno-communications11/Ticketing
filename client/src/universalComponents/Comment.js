import React, { useRef } from "react";
import { TbSend2 } from "react-icons/tb";
import { Button } from "react-bootstrap";
import { RiImageAddFill } from "react-icons/ri";
import { ImCross } from "react-icons/im";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Comment.css"; // New custom stylesheet

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
      className="comment-form w-100 d-flex flex-column border rounded mt-2 p-2"
    >
      <div className="d-flex align-items-center flex-wrap">
        {/* Add Image Button */}
        <RiImageAddFill
          className="comment-icon upload-icon ms-2 ms-md-3"
          onClick={handleUploadClick}
        />
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="d-none"
          onChange={handleFileChange}
        />

        {/* Comment Input */}
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Enter Comment"
          className="comment-textarea fw-medium rounded-3 border-0 bg-transparent flex-grow-1 mx-2"
          rows={1}
          required
          disabled={commentLoading}
        />

        {/* Submit Button */}
        {commentLoading ? (
          <div className="spinner-border text-pink comment-spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          <Button
            type="submit"
            className="comment-submit-btn bg-transparent border-0 d-flex align-items-center"
          >
            <TbSend2 className="fs-3 text-pink" />
          </Button>
        )}
      </div>

      {/* Display Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="selected-files mt-2 ms-2">
          <strong className="text-pink">Selected Images:</strong>
          <ul className="list-unstyled mt-1">
            {selectedFiles.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center text-muted mb-1"
              >
                <span className="file-name text-truncate">
                  {file.name}
                </span>
                <Button
                  variant="link"
                  className="remove-file-btn ms-2 p-0"
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