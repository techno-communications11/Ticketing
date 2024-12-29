import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Dropdown, Modal } from "react-bootstrap";
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

import "react-medium-image-zoom/dist/styles.css";

const Individualmarketss = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [uploadedFileUrl, setUploadedFileUrl] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { markets, loading } = useSelector((state) => state.market);
  const selectedId = useSelector((state) => state.market.selectedId);
  const [comment, setComment] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [getcomment, setGetComment] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [commentLoading, setCommentLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleWheel = (event) => {
    const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prevZoom) => Math.min(Math.max(prevZoom + zoomDelta, 1), 5)); // Limit zoom between 1x and 5x
  };

  const handleMouseMove = (event) => {
    if (zoom > 1) {
      const { clientX, clientY, target } = event;
      const { left, top, width, height } = target.getBoundingClientRect();

      const offsetX = ((clientX - left) / width - 0.5) * 100;
      const offsetY = ((clientY - top) / height - 0.5) * 100;

      setOffset({ x: offsetX, y: offsetY });
    }
  };
  const departments = [
    // "NTID Mappings",
    // "Trainings",
    // "Accessories Order",
    // "YUBI Key Setups",
    // "Charge Back/Commission",
    // "Inventory",
    "Admin",
    "Software India",
    // "Maintenance",
    // "Housing",
    // "CAM NW",
    // "HR Payroll",
  ];

  const {
    ntid: userNtid,
    department,
    fullname,
    subDepartment,
  } = getDecodedToken() || {};
  const usersId = getDecodedToken().id;

  const fetchData = async () => {
    try {
      const { data } = await apiRequest.get("/auth/GetUsers");
      const teamMembers = data?.teamMembers || [];
      const filteredUsers = teamMembers.filter(
        (member) => member.fullname !== fullname
      );

      setUsers(filteredUsers);

      if (filteredUsers.length === 0) {
        console.warn("No users found in your team");
      }
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
          console.warn("No ticket ID found in local storage.");
          return;
        }

        const { data } = await apiRequest.get(
          `/createTickets/getcomment/?ticketId=${storedId}`
        );
        setGetComment(data);

        console.log("Comments fetched:", data);
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
    // console.log(storedId,"strid")
    if (storedId && (!selectedId || selectedId !== storedId)) {
      dispatch(setId(storedId));
      dispatch(fetchIndividualTickets(storedId));
    }
  }, [selectedId, dispatch]);

  useEffect(() => {
    // Guard clause: Check for ticketId early
    if (!markets?.ticketId) {
      console.warn("No ticketId available in markets.");
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
          console.warn("No files found for the specified ticketId.");
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
    console.log("update opened by");
    try {
      const endpoint = departments?.includes(department)
        ? "/createTickets/update_opened_by"
        : "";
      const response = await apiRequest.put(endpoint, {
        ticketId: markets.ticketId,
        usersId,
      });

      if (response.status === 200) {
        console.log("Ticket updated successfully:", response.data);
      }
    } catch (err) {
      console.error("Error updating opened by:", err);
    }
  };

  useEffect(() => {
    const updateInitialStatus = async () => {
      if (
        markets.userId !== usersId &&
        markets.ntid !== userNtid &&
        department !== "SuperAdmin"
      ) {
        await updateTicketStatus("2");
      }
    };
    updateInitialStatus();
    updateOpenedBy();
    fetchData();
  }, [markets, userNtid, department]);

  const updateTicketStatus = async (statusId) => {
    try {
      const response = await apiRequest.put(
        `/createTickets/updateprogress/?statusId=${statusId}&ticketId=${markets.ticketId}&usersId=${usersId}`
      );

      if (response.status === 200) {
        handleToastAndNavigation(statusId);
      }
    } catch (error) {
      console.error(`Error updating status to ${statusId}:`, error);
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
        toast.success("Ticket reopened successfully", {
          position: "top-right",
          autoClose: 1500,
        });
        setTimeout(() => {
          navigate(isDistrictManager ? "/reopened" : "/superAdminHome");
        }, 1500);
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

  if (loading) {
    return (
      <div className="vh-100">
        <div className="loader d-flex align-items-center justify-content-center vh-80"></div>
      </div>
    );
  }

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCommentLoading(true);

    try {
      const formData = new FormData();
      // Append required fields
      formData.append("ticketId", markets.ticketId);
      formData.append("comment", comment.trim()); // Trim to avoid unnecessary spaces
      formData.append("createdBy", fullname);

      // Append files only if there are selected files
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("commentedfiles", file);
        });
      }

      const response = await apiRequest.put(
        "/createTickets/postcomment",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        // Reset fields after successful submission
        resetCommentForm();
        fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setCommentLoading(false);
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

        // Update ticket status and fetch updated tickets
        await updateTicketStatus("3");

        setTimeout(() => {
          dispatch(setId(storedId));
          dispatch(fetchIndividualTickets(storedId));
        }, 1500); // Removed unnecessary array brackets
      }
    } catch (error) {
      console.error("Error assigning department:", error);
      toast.error("Failed to assign department.");
    } finally {
      setSelectedDepartment("");
    }
  };

  const onhandleAllot = async (user) => {
    if (!user || !markets.ticketId) {
      toast.error("Invalid user or ticket ID");
      return;
    }

    try {
      const response = await apiRequest.put("/createTickets/alloted", {
        user,
        ticketId: markets.ticketId,
      });

      if (response.status === 200) {
        toast.success(`Assigned to ${user}`);

        // Update ticket status
        await updateTicketStatus("3");

        // Navigate after a slight delay
        setTimeout(() => {
          navigate("/departmentnew");
        }, 1500);
      }
    } catch (error) {
      console.error(`Error assigning to ${user}:`, error);
      toast.error(`Error assigning to ${user}`);
    } finally {
      // Reset selected department regardless of success or failure
      setSelectedDepartment("");
    }
  };

  let count = 0;
  getcomment.map((comment) => {
    if (comment.createdBy === markets.fullname) {
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

    try {
      const { isConfirmed } = await Swal.fire({
        title: `Confirm ${
          config.actionText.charAt(0).toUpperCase() + config.actionText.slice(1)
        }`,
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
            title: `Ticket ${config.actionText}d`,
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

  const getNavigationPath = (action) => {
    if (department === "District Manager" && action === "settle") {
      return "/completed";
    } else if (department === "Employee" && action === "reopen") {
      return "/home";
    }
    return "/"; // Default path
  };

  const handleConfirmSettled = () => handleTicketAction("settle");
  const handleRequestReopen = () => handleTicketAction("reopen");

  const handleCallbackAction = async () => {
    const department = "District Manager";
    console.log("Callback triggered", markets.ticketId, usersId);

    try {
      // Construct API request URL with necessary parameters
      const apiUrl = `/createTickets/callback/?department=${department}&ticketId=${markets.ticketId}&usersId=${usersId}`;

      // Make the API call to assign the ticket
      const response = await apiRequest.put(apiUrl);

      if (response.status === 200) {
        // Display success toast message
        toast.success(`Assigned to ${department}`);

        // Update the ticket status
        await updateTicketStatus("2");

        // Navigate to the opened tickets page after a delay
        setTimeout(() => {
          navigate("/openedTickets");
        }, 1500);
      }
    } catch (error) {
      // Handle error and show a failure toast message
      console.error(`Error assigning to ${department}:`, error);
      toast.error(`Error assigning to ${department}`);
    } finally {
      // Clear the selected department field
      setSelectedDepartment("");
    }
  };

  let counts = getcomment.reduce((acc, comment) => {
    if (comment.createdBy === markets.fullname) {
      acc++;
    }
    return acc;
  }, 0);

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
                        className="d-block w-100 img-fluid"
                        style={{
                          height: "250px",
                          objectFit: "cover", // Ensure image fills the container without distortion
                        }}
                        onClick={() => setShowModal(true)} // Open modal on image click
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
                  (department !== "Employee" &&
                    department !== "SuperAdmin" &&
                    markets.userId !== usersId &&
                    markets.status?.name !== "completed") ||
                  ((department === "Employee" ||
                    department === "District Manager") &&
                    markets.status?.name === "completed") ||
                  (department === "SuperAdmin" &&
                    markets.status?.name === "reopened" &&
                    markets.userId === usersId);

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
                              width: "50vw",
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

              {counts >= 1 &&
                department === "Employee" &&
                markets.status?.name === "completed" && (
                  <Button
                    variant="primary fw-medium w-auto ms-auto me-3"
                    onClick={handleRequestReopen}
                  >
                    Request Reopen
                  </Button>
                )}

              {(department === "District Manager" ||
                department === "Market Manager" ||
                department === "SuperAdmin") &&
                markets.status?.name === "completed" && (
                  <Button
                    variant="primary fw-medium w-auto me-2"
                    onClick={() => handleConfirmAction("5", "reopened")}
                  >
                    Reopen
                  </Button>
                )}

              {(department === "District Manager" ||
                subDepartment === "Manager") &&
                markets.status?.name === "completed" &&
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

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ticket Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {uploadedFileUrl && uploadedFileUrl.length > 0 ? (
            <Carousel>
              {uploadedFileUrl.map((url, index) => (
                <Carousel.Item key={index}>
                  <div
                    onWheel={handleWheel}
                    onMouseMove={handleMouseMove}
                    style={{
                      width: "100%",
                      height: "auto", // Adjust height based on image aspect ratio
                      overflow: "hidden",
                      position: "relative",
                      cursor: zoom > 1 ? "grab" : "default",
                    }}
                  >
                    <img
                      src={url}
                      alt={`Ticket File ${index + 1}`}
                      className="d-block w-100 img-fluid"
                      style={{
                        width: "100%", // Ensure the image fills the width
                        height: "auto", // Let the height adjust based on the width
                        objectFit: "contain", // Maintain aspect ratio of the image
                        transform: `scale(${zoom}) translate(${offset.x}%, ${offset.y}%)`,
                        transition: "transform 0.1s",
                      }}
                    />
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <div className="text-center">No Images Available</div>
          )}
        </Modal.Body>
      </Modal>

      {department === "Employee" &&
        markets.status?.name === "completed" &&
        markets.isSettled !== true && (
          <span className="text-danger fw-medium">
            * Enter comment describing the purpose of reopening the ticket
            before requesting reopen
          </span>
        )}
      <ToastContainer />
    </div>
  );
};

export default Individualmarketss;
