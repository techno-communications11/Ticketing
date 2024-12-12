import React, { useState, useRef } from "react";
import { TbSend2 } from "react-icons/tb";
import { Button } from "react-bootstrap";
import { RiImageAddFill } from "react-icons/ri";
import { ImCross } from "react-icons/im";


function Comment({ handleCommentChange, handleSubmit, comment, commentLoading,selectedFiles,setSelectedFiles }) {
  const fileInputRef = useRef(null);
  // const [selectedFiles, setSelectedFiles] = useState([]);

  const uploadMultipleImages = () => {
    fileInputRef.current.click(); // Open file dialog
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]); // Add new files to existing files
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

 

  return (
    <form
      onSubmit={handleSubmit}
      className="w-100 d-flex flex-column border rounded mt-2"
    >
      <div className="d-flex align-items-center">
        <RiImageAddFill
          className="fs-4 ms-3"
          style={{ cursor: "pointer", color: "#E10174" }}
          onClick={uploadMultipleImages}
        />
        <input
          type="file"
          ref={fileInputRef}
          multiple
          // accept="*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Enter Comment"
          className="fw-medium rounded-3 border-0 bg-transparent flex-grow-1"
          rows={1}
          style={{
            resize: "none",
            overflow: "hidden",
            outline: "none",
            boxShadow: "none",
            textAlign: "center",
            lineHeight: "1.5",
            minHeight: "50px",
            padding: "15px 5px",
            marginRight: "10px",
          }}
          required
          disabled={commentLoading}
        />
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

      {/* Display selected file names with remove option */}
      {selectedFiles.length > 0 && (
        <div className="mt-2 ms-2">
          <strong>Selected Images:</strong>
          <ul className="list-unstyled">
            {selectedFiles.map((file, index) => (
              <li key={index} className="d-flex align-items-center text-muted ">
                {file.name}
                <Button
                  variant="link"
                  className="text-danger ms-3"
                  onClick={() => removeFile(index)}
                >
                  <ImCross className="text-danger"/>
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
