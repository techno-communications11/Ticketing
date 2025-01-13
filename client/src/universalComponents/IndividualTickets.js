import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Dropdown } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { apiRequest } from "../lib/apiRequest";
import { fetchIndividualTickets, setId } from "../redux/marketSlice";
import "../styles/loader.css";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { HiArrowSmRight } from "react-icons/hi";
import Comment from "./Comment";
import getDecodedToken from "./decodeToken";
import formatDate from "./FormatDate";
import { Carousel } from "react-bootstrap";
import debounce from "lodash/debounce";



const Individualmarketss = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [uploadedFileUrl, setUploadedFileUrl] = useState([]);
  const { markets, loading } = useSelector((state) => state.market);
  const selectedId = useSelector((state) => state.market.selectedId);
  const [comment, setComment] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [getcomment, setGetComment] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const[statusLoading,setsatusLoading]=useState(false);

  const departments = [
    // "NTID Mappings",
    // "Trainings",
    // "Accessories Order",
    // "YUBI Key Setups",
    "Commission",
    "Inventory",
    "Admin",
    "Software India",
    "Maintenance",
    // "Housing",
    // "CAM NW",
    "HR Payroll",
    "Reporting"
  ];

  const {
    ntid: userNtid,
    department,
    fullname,
    subDepartment,
  } = getDecodedToken() || {};
  const usersId = getDecodedToken().id;
  const fname = getDecodedToken().fullname;

  const fetchData = async () => {
    try {
      const { data } = await apiRequest.get("/auth/GetUsers");
      const teamMembers = data?.teamMembers || [];
      const filteredUsers = teamMembers.filter(
        (member) => member.fullname !== fullname
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
    }
  };

  const storedId = localStorage.getItem("selectedId");

  const fetchComments = useCallback(
    debounce(async () => {
      try {
        if (!storedId) {
          return;
        }

        const { data } = await apiRequest.get(
          `/createTickets/getcomment/?ticketId=${storedId}`
        );
        setGetComment(data);
      } catch (error) {
        console.error(
          "Error fetching comments:",
          error.response?.data || error.message
        );
      }
    }, 300), // Delay in milliseconds
    [storedId]
  );

  useEffect(() => {
    fetchComments();
  }, [markets.ticketId, fetchComments]);

  useEffect(() => {
    const storedId = localStorage.getItem("selectedId");
    if (storedId && (!selectedId || selectedId !== storedId)) {
      dispatch(setId(storedId));
      dispatch(fetchIndividualTickets(storedId));
    }
  }, [selectedId, dispatch]);

  useEffect(() => {
    // Guard clause: Check for ticketId early
    if (!markets?.ticketId) {
      setUploadedFileUrl(null); // Clear the state if ticketId is not available
      return;
    }

    // Fetch files associated with the ticketId
    const fetchFiles = async () => {
      try {
        const apiUrl = `/createTickets/getticketfiles/${markets.ticketId}`;
        const { data } = await apiRequest.get(apiUrl);

        // Safely extract signedUrls from the response
        const signedUrls = data?.signedUrls || [];

        if (signedUrls.length > 0) {
          setUploadedFileUrl(signedUrls); // Store the signed URLs in state
        } else {
          setUploadedFileUrl([]); // Clear the state if no files are found
        }
      } catch (error) {
        console.error(
          "Error fetching files:",
          error.response?.data || error.message
        );
        setUploadedFileUrl([]); // Reset the state on error
      }
    };

    fetchFiles();
  }, [markets?.ticketId]);

  const updateOpenedBy = async () => {
    try {
      const endpoint = departments?.includes(department)
        ? "/createTickets/update_opened_by"
        : "";
      await apiRequest.put(endpoint, {
        ticketId: markets.ticketId,
        usersId,
      });
    } catch (err) {
      console.error("Error updating opened by:", err);
    }
  };

  useEffect(() => {
    const updateInitialStatus = async () => {
      if (
        markets.userId !== usersId &&
        markets.ntid !== userNtid &&
        department !== "SuperAdmin" &&
        !markets.openedBy // Only proceed if openedBy is null
      ) {
        await updateTicketStatus("2");
      }
    };
    // Call functions based on conditions
    if (!markets.openedBy) {
      updateInitialStatus();
    }
    // Other dependent calls
    updateOpenedBy();
    fetchData();
  }, [markets, userNtid, department]);

  const updateTicketStatus = async (statusId) => {
    setsatusLoading(true);
    try {
      const response = await apiRequest.put(
        `/createTickets/updateprogress/?statusId=${statusId}&ticketId=${markets.ticketId}&usersId=${usersId}`
      );

      if (response.status === 200) {
        handleToastAndNavigation(statusId);
      }
    } catch (error) {
      console.error(`Error updating status to ${statusId}:`, error);
    } finally{
      setsatusLoading(false)
    }
  };

  const handleToastAndNavigation = (statusId) => {
    const isDistrictManager = department === "District Manager";

    switch (statusId) {
      case "4":
        toast.success("Ticket marked as completed!", {
          position: "top-right",
          autoClose: 1500,
        });
        setTimeout(() => {
          navigate(isDistrictManager ? "/completed" : "/departmentcompleted");
        }, 1500);
        break;

      case "5":
        const TOAST_DURATION = 1500; // Constant for toast duration

        toast.success("Ticket reopened successfully", {
          position: "top-right",
          autoClose: TOAST_DURATION,
        });

        // Helper function to determine navigation path
        const getNavigationPath = () => {
          if (isDistrictManager) {
            return "/reopened";
          }
          if (departments?.includes(department)) {
            return "/departmentnew";
          }
          if (department === "SuperAdmin") {
            return "/superAdminHome";
          }
          return "/defaultFallback"; // Fallback path
        };

        const navigationPath = getNavigationPath();

        // Navigate after delay
        setTimeout(() => {
          navigate(navigationPath);
        }, TOAST_DURATION);
        break;

      case "3":
        setTimeout(() => {
          if (isDistrictManager) {
            navigate("/inprogress");
          }
        }, 1500);
        break;

      case "2":
        // Add logic here if needed for statusId === "2"
        break;

      default:
        console.warn(`Unhandled statusId: ${statusId}`);
    }
  };

  const handleConfirmAction = async (action, text) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You are about to mark this ticket as ${text}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${text}!`,
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      updateTicketStatus(action);
    }
  };

 
  

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCommentLoading(true);

    try {
      // Create a new FormData object
      const formData = new FormData();
      formData.append("ticketId", markets.ticketId);
      formData.append("comment", comment.trim()); // Trim to avoid unnecessary spaces
      formData.append("createdBy", fullname);

      // Append files if available
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("commentedfiles", file);
        });
      }

      // Send the request to submit the comment
      const response = await apiRequest.put(
        "/createTickets/postcomment",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Check if the request was successful
      if (response.status === 200) {
        toast.success("Comment submitted successfully");
        resetCommentForm(); // Reset the form after submission
        fetchComments(); // Refresh the comments list
      } else {
        toast.error("Failed to submit comment");
      }
    } catch (error) {
      // Log and display specific error message
      console.error("Error submitting comment:", error);
      toast.error("An error occurred while submitting the comment");
    } finally {
      setCommentLoading(false); // Stop loading indicator
    }
  };

  const resetCommentForm = () => {
    setComment(""); // Clear comment input
    setSelectedFiles([]); // Clear uploaded files
  };

  const onhandleDepartment = (e) => {
    const selectedDept = e.target.value || selectedDepartment;
    setSelectedDepartment(selectedDept);
    assignToDepartment(selectedDept);
  };

  const assignToDepartment = async (selectedDept) => {
    setsatusLoading(true);
    if (!selectedDept || !markets.ticketId) {
      toast.error("Invalid department or ticket ID");
      return;
    }

    try {
      const response = await apiRequest.put(
        `/createTickets/assigntodepartment/?department=${selectedDept}&ticketId=${markets.ticketId}`
      );

      if (response.status === 200) {
        toast.success(`Assigned to ${selectedDept}`);

        // Update ticket status
        await updateTicketStatus("3");

        // Fetch updated tickets and dispatch actions
        await fetchUpdatedTickets();
      } else {
        // Handle unexpected status code
        toast.error("Failed to assign department. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning department:", error);
      toast.error("Failed to assign department.");
    } finally {
      // Reset selected department
      setSelectedDepartment("");
      setsatusLoading(false);
    }
  };

  // Function to fetch updated tickets and dispatch actions
  const fetchUpdatedTickets = async () => {
    try {
      dispatch(setId(storedId)); // Assuming `storedId` is available globally
      await dispatch(fetchIndividualTickets(storedId));
    } catch (error) {
      console.error("Error fetching updated tickets:", error);
    }
  };

  const onhandleAllot = async (user) => {
    setsatusLoading(true)
    if (!user || !markets.ticketId) {
      toast.error("Invalid user or ticket ID");
      return;
    }

    try {
      // Sending the request to allot the ticket
      const response = await apiRequest.put("/createTickets/alloted", {
        user,
        ticketId: markets.ticketId,
      });

      // Check if the response status indicates success
      if (response.status === 200) {
        toast.success(`Assigned to ${user}`);

        // Update the ticket status and navigate without setTimeout
        await updateTicketStatus("3");

        // Navigate to the "departmentnew" page after a small delay to allow the toast message to show
        await delay(1500);
        navigate("/departmentnew");
      }
    } catch (error) {
      console.error(`Error assigning to ${user}:`, error);
      toast.error(`Error assigning to ${user}`);
    } finally {
      // Reset selected department regardless of success or failure
      resetDepartmentState();
      setsatusLoading(true)
    }
  };

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.6)", // Semi-transparent white
          zIndex: 1050,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="loader" role="status">
        
        </div>
      </div>
    );
  }
    
  if (statusLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.6)", // Semi-transparent white
          zIndex: 1050,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="loader" role="status">
        
        </div>
      </div>
    );
  }

  // Helper function to delay execution (using Promise)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Function to reset department state or any other state you need to clear
  const resetDepartmentState = () => {
    setSelectedDepartment("");
    // Reset any other relevant states here
  };

  let count = 0;
  getcomment.map((comment) => {
    if (comment.createdBy === fname && markets.status.name === "complete") {
      count++;
    }
  });

  const handleTicketAction = async (action) => {
    const actionsConfig = {
      settle: {
        actionText: "settle",
        confirmationText: "Are you sure you want to settle this ticket?",
        endpoint: "/createTickets/settlement",
      },
      reopen: {
        actionText: "request to reopen",
        confirmationText:
          "Are you sure you want to request reopening this ticket?",
        endpoint: "/createTickets/request-reopen",
      },
    };

    const config = actionsConfig[action];
    if (!config) return;

    const capitalizeActionText = (text) =>
      text.charAt(0).toUpperCase() + text.slice(1); // Capitalize action text

    try {
      const { isConfirmed } = await Swal.fire({
        title: `Confirm ${capitalizeActionText(config.actionText)}`,
        text: config.confirmationText,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E10174",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${config.actionText} it!`,
        cancelButtonText: "Cancel",
      });

      if (isConfirmed) {
        const response = await apiRequest.put(config.endpoint, {
          ticketId: markets.ticketId,
        });

        if (response.status === 200) {
          await Swal.fire({
            icon: "success",
            title: `Ticket ${capitalizeActionText(config.actionText)}d`,
            text: `The ticket has been ${config.actionText}d successfully.`,
            confirmButtonColor: "#E10174",
          });

          handlePostActionNavigation(action);
        }
      }
    } catch (error) {
      console.error(`Error processing ${config.actionText}:`, error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: `There was an error ${config.actionText}ing the ticket. Please try again.`,
        confirmButtonColor: "#E10174",
      });
    }
  };

  const handlePostActionNavigation = (action) => {
    const navigateTo = getNavigationPath(action);

    if (navigateTo) {
      setTimeout(() => {
        dispatch(setId(storedId));
        dispatch(fetchIndividualTickets(storedId));
        navigate(navigateTo);
      }, 1500);
    }
  };

  const getNavigationPath = (action, department, departments) => {
    if (action === "settle") {
      if (department === "District Manager") {
        return "/completed";
      }
      if (department === "SuperAdmin") {
        return "/SuperAdminHome";
      }
      if (departments.includes(department)) {
        return "/departmentcompleted";
      }
      return "/"; // Default path if no department matches
    }
  
    if (action === "reopen" && department === "Employee") {
      return "/home";
    }
  
    return "/"; // Default path
  };
  

  const handleConfirmSettled = () => handleTicketAction("settle");
  const handleRequestReopen = () => handleTicketAction("reopen");

  const handleCallbackAction = async () => {
    const department = "District Manager";

    const apiUrl = `/createTickets/callback/?department=${department}&ticketId=${markets.ticketId}&usersId=${usersId}`;

    try {
      // Make the API call to assign the ticket
      const { status } = await apiRequest.put(apiUrl);

      if (status === 200) {
        // Display success toast message
        toast.success(`Assigned to ${department}`);

        // Update the ticket status and navigate after success
        await updateTicketStatus("2");
        setTimeout(() => navigate("/openedTickets"), 1500);
      }
    } catch (error) {
      // Handle error with a toast message
      console.error(`Error assigning to ${department}:`, error);
      toast.error(`Error assigning to ${department}`);
    } finally {
      // Reset selected department
      setSelectedDepartment("");
    }
  };

  let counts = getcomment.reduce((acc, comment) => {
    if (comment.createdBy === fname) {
      acc++;
    }
    return acc;
  }, 0);

  const handleImageClick = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const canRequestReopen =
    counts >= 1 &&
    department === "Employee" &&
    markets.status?.name === "completed" &&
    !markets.requestreopen;

  return (
    <div className="container mt-2">
      <h5
        className="mb-3 font-family text-start"
        style={{ color: "#E10174", fontWeight: "bold" }}
      >
        Ticket Id:
        <span className="fs-5 fs-md-3 text-primary text-wrap ms-2">
          {markets.ticketId || "No ticket details available"}
        </span>
      </h5>
      {markets ? (
        <div className="row border bg-white rounded p-2">
          <div className="col-md-8">
            <div className="row">
              {Object.entries({
                Email: String(markets.ntid || ""),
                "Full Name": String(markets.fullname || ""),
                Market: String(markets.market || ""),
                "Selected Store": String(markets.selectStore || ""),
                "Phone Number": String(markets.phoneNumber || ""),
                "Ticket Regarding": String(markets.ticketRegarding || ""),
                "Selected Department": String(markets.selectedDepartment || ""),
                "Selected Sub Department": String(
                  markets.selectedSubdepartment || ""
                ),
                Description: String(markets.description || ""),
                "Created At": formatDate(markets.createdAt) || "",
              }).map(([key, value]) => (
                <div className="col-md-6 mb-2" key={key}>
                  <h6 className="card-subtitle mb-1 text-muted fw-medium">
                    {key}
                  </h6>
                  <p className="card-text">
                    {typeof value === "string"
                      ? value.length < 50
                        ? value
                        : `${value.slice(0, 40)}\n ${value.slice(40)}`
                      : value || "N/A"}
                  </p>
                </div>
              ))}
              <div className="mt-2 mb-2 col-12">
                <h5 className="fw-medium text-secondary">Comments:</h5>
                {getcomment.length > 0 ? (
                  getcomment
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .map((comment, index) => (
                      <div
                        key={index}
                        className="comment-item mb-3"
                        style={{ lineHeight: "1" }}
                      >
                        <small className="ms-2 fs-6 text-muted fw-medium">
                          <HiArrowSmRight /> {comment.comment}
                        </small>
                        <br />
                        <small
                          className="ms-2 text-muted"
                          style={{ lineHeight: "1" }}
                        >
                          Commented By:{" "}
                          <span className="fw-medium">{comment.createdBy}</span>{" "}
                          | {formatDate(comment.createdAt)}
                          <div>
                            {comment.commentedfiles &&
                              comment.commentedfiles.map((item, fileIndex) => {
                                const fileName = item.split("/").pop(); // Extract file name from URL
                                const shortName =
                                  fileName.length > 20
                                    ? fileName.substring(0, 17) + "..."
                                    : fileName; // Shorten the name if it's too long
                                return (
                                  <a
                                    key={fileIndex}
                                    href={item}
                                    download={fileName}
                                    target="_blank"
                                  >
                                    <span>{shortName}</span>
                                    <img
                                      src={item}
                                      alt={`file-${fileIndex}`}
                                      style={{
                                        maxWidth: "20px",
                                        marginLeft: "10px",
                                      }}
                                    />
                                  </a>
                                );
                              })}
                          </div>
                        </small>
                      </div>
                    ))
                ) : (
                  <p>No comments available for this ticket.</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3 text-center">
            <div className="card shadow-sm rounded">
              {uploadedFileUrl && uploadedFileUrl.length > 0 ? (
                <Carousel>
                  {uploadedFileUrl.map((url, index) => (
                    <Carousel.Item key={index}>
                      <img
                        src={url}
                        alt={`Ticket File ${index + 1}`}
                        className="d-block w-100"
                        style={{
                          maxHeight: "250px", // Limit the maximum height
                          objectFit: "cover", // Preserve original dimensions and aspect ratio
                        }}
                        onClick={() => handleImageClick(url)} // Open modal on image click
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div
                  className="card-img-top img-thumbnail text-center d-flex justify-content-center align-items-center"
                  style={{ height: "250px", width: "100%" }}
                >
                  <span>No Images Available</span>
                </div>
              )}
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-7 d-flex align-items-center">
              {(() => {
                const canComment =
                  (department === "Employee" &&
                    markets.status?.name === "completed") ||
                  department !== "Employee";

                if (canComment) {
                  return (
                    <Comment
                      commentLoading={commentLoading}
                      comment={comment}
                      selectedFiles={selectedFiles}
                      setSelectedFiles={setSelectedFiles}
                      handleCommentChange={handleCommentChange}
                      handleSubmit={handleSubmit}
                    />
                  );
                }
                return null;
              })()}
            </div>

            <div className="col-5 d-flex justify-content-end align-items-center mt-4">
              {departments?.includes(department) &&
                markets.status?.name !== "completed" && (
                  <Dropdown className="mx-2">
                    <Dropdown.Toggle variant="primary" id="dropdown-basic">
                      Allocate
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                      style={{ height: "350px", overflow: "scroll" }}
                    >
                      {users.sort().map((user, index) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => onhandleAllot(user.fullname)}
                          className="text-primary text-capitalize shadow-lg"
                        >
                          {user.fullname}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}

              {department !== "Employee" &&
                department !== "SuperAdmin" &&
                markets.usersId !== usersId && (
                  <>
                    {markets.status?.name !== "completed" &&
                      markets.departmentId === "19" && (
                        <Dropdown className="mx-2">
                          <Dropdown.Toggle
                            variant="primary"
                            id="dropdown-basic"
                          >
                            Assign to
                          </Dropdown.Toggle>
                          <Dropdown.Menu
                            style={{
                              height: "350px",
                              overflow: "scroll",
                              width: "10vw",
                            }}
                          >
                            {departments.sort().map((dept, index) => (
                              <Dropdown.Item
                                key={index}
                                onClick={() =>
                                  onhandleDepartment({
                                    target: { value: dept },
                                  })
                                }
                                className="text-primary"
                              >
                                {dept}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      )}

                    {(() => {
                      const isEligibleForClose =
                        markets.status?.name !== "completed" &&
                        (markets.departmentId === "19" ||
                          departments.includes(department));

                      if (isEligibleForClose) {
                        return (
                          <button
                            className="btn btn-success"
                            onClick={() =>
                              handleConfirmAction("4", "mark as completed")
                            }
                          >
                            Close
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}
              {canRequestReopen && (
                <Button
                  variant="primary fw-medium w-auto ms-auto me-3"
                  onClick={handleRequestReopen}
                >
                  Request Reopen
                </Button>
              )}
              {counts >= 1 &&
                department !== "Employee" &&
                markets.status?.name === "completed" &&
                subDepartment !== "User" && (
                  <Button
                    variant="primary fw-medium w-auto me-2"
                    onClick={() => handleConfirmAction("5", "reopened")}
                  >
                    Reopen
                  </Button>
                )}

              {department !== "Employee" &&
                markets.status?.name === "completed" &&
                subDepartment !== "User" &&
                !markets.isSettled && (
                  <Button
                    variant="success fw-medium w-auto"
                    onClick={handleConfirmSettled}
                  >
                    Settle
                  </Button>
                )}

              {(department === "District Manager" ||
                department === "Market Manager") &&
                markets.departmentId !== "19" &&
                markets.status?.name !== "completed" &&
                markets.userId !== usersId && (
                  <Button
                    variant="success fw-medium w-auto"
                    onClick={handleCallbackAction}
                  >
                    Callback
                  </Button>
                )}
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info mt-3">No tickets available.</div>
      )}

      {subDepartment !== "User" && markets.status?.name === "completed" && (
        <span className="text-danger fw-medium">
          * Enter comment describing the purpose of reopening the ticket before
          requesting reopen
        </span>
      )}
      <ToastContainer />
    </div>
  );
};

export default Individualmarketss;
