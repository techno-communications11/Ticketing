import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Dropdown, Carousel } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { apiRequest } from "../lib/apiRequest";
import { fetchIndividualTickets, setId } from "../redux/marketSlice";
import "../styles/loader.css";
import "../styles/Individualmarketss.css"; // New custom stylesheet
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { HiArrowSmRight } from "react-icons/hi";
import Comment from "./Comment";
import getDecodedToken from "./decodeToken";
import formatDate from "./FormatDate";
import debounce from "lodash/debounce";
import { FaImage } from "react-icons/fa";

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
  const [statusLoading, setStatusLoading] = useState(false);

  const departments = [
    "Commission",
    "Inventory",
    "Admin",
    "Software India",
    "Maintenance",
    "HR Payroll",
    "Reporting",
  ];

  const { ntid: userNtid, department, fullname, subDepartment } =
    getDecodedToken() || {};
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
      console.error("Error fetching users:", error.response?.data || error.message);
    }
  };

  const storedId = localStorage.getItem("selectedId");

  const fetchComments = useCallback(
    debounce(async () => {
      try {
        if (!storedId) return;
        const { data } = await apiRequest.get(
          `/createTickets/getcomment/?ticketId=${storedId}`
        );
        setGetComment(data);
      } catch (error) {
        console.error("Error fetching comments:", error.response?.data || error.message);
      }
    }, 300),
    [storedId]
  );

  useEffect(() => {
    fetchComments();
  }, [markets.ticketId, fetchComments]);

  useEffect(() => {
    if (storedId && (!selectedId || selectedId !== storedId)) {
      dispatch(setId(storedId));
      dispatch(fetchIndividualTickets(storedId));
    }
  }, [selectedId, dispatch]);

  useEffect(() => {
    if (!markets?.ticketId) {
      setUploadedFileUrl([]);
      return;
    }
    const fetchFiles = async () => {
      try {
        const { data } = await apiRequest.get(
          `/createTickets/getticketfiles/${markets.ticketId}`
        );
        setUploadedFileUrl(data?.signedUrls || []);
      } catch (error) {
        console.error("Error fetching files:", error.response?.data || error.message);
        setUploadedFileUrl([]);
      }
    };
    fetchFiles();
  }, [markets?.ticketId]);

  const updateOpenedBy = async () => {
    try {
      const endpoint = departments?.includes(department)
        ? "/createTickets/update_opened_by"
        : "";
      await apiRequest.put(endpoint, { ticketId: markets.ticketId, usersId });
    } catch (error) {
      console.error("Error updating opened by:", error);
    }
  };

  useEffect(() => {
    const updateInitialStatus = async () => {
      if (
        markets.userId !== usersId &&
        markets.ntid !== userNtid &&
        department !== "SuperAdmin" &&
        !markets.openedBy
      ) {
        await updateTicketStatus("2");
      }
    };
    if (!markets.openedBy) updateInitialStatus();
    updateOpenedBy();
    fetchData();
  }, [markets, userNtid, department]);

  const updateTicketStatus = async (statusId) => {
    setStatusLoading(true);
    try {
      const response = await apiRequest.put(
        `/createTickets/updateprogress/?statusId=${statusId}&ticketId=${markets.ticketId}&usersId=${usersId}`
      );
      if (response.status === 200) handleToastAndNavigation(statusId);
    } catch (error) {
      console.error(`Error updating status to ${statusId}:`, error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleToastAndNavigation = (statusId) => {
    const isDistrictManager = department === "District Manager";
    switch (statusId) {
      case "4":
        toast.success("Ticket marked as completed!");
        setTimeout(() => navigate(isDistrictManager ? "/completed" : "/departmentcompleted"), 1500);
        break;
      case "5":
        toast.success("Ticket reopened successfully");
        setTimeout(() =>
          navigate(
            isDistrictManager
              ? "/reopened"
              : departments?.includes(department)
              ? "/departmentnew"
              : department === "SuperAdmin"
              ? "/superAdminHome"
              : "/defaultFallback"
          ), 1500);
        break;
      case "3":
        setTimeout(() => isDistrictManager && navigate("/inprogress"), 1500);
        break;
      case "2":
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
    if (result.isConfirmed) updateTicketStatus(action);
  };

  const handleCommentChange = (e) => setComment(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCommentLoading(true);
    try {
      const formData = new FormData();
      formData.append("ticketId", markets.ticketId);
      formData.append("comment", comment.trim());
      formData.append("createdBy", fullname);
      selectedFiles.forEach((file) => formData.append("commentedfiles", file));
      const response = await apiRequest.put("/createTickets/postcomment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        toast.success("Comment submitted successfully");
        setComment("");
        setSelectedFiles([]);
        fetchComments();
      } else {
        toast.error("Failed to submit comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("An error occurred while submitting the comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const onhandleDepartment = (e) => {
    const selectedDept = e.target.value || selectedDepartment;
    setSelectedDepartment(selectedDept);
    assignToDepartment(selectedDept);
  };

  const assignToDepartment = async (selectedDept) => {
    setStatusLoading(true);
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
        await updateTicketStatus("3");
        dispatch(setId(storedId));
        await dispatch(fetchIndividualTickets(storedId));
      } else {
        toast.error("Failed to assign department");
      }
    } catch (error) {
      console.error("Error assigning department:", error);
      toast.error("Failed to assign department");
    } finally {
      setSelectedDepartment("");
      setStatusLoading(false);
    }
  };

  const onhandleAllot = async (user) => {
    setStatusLoading(true);
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
        await updateTicketStatus("3");
        setTimeout(() => navigate("/departmentnew"), 1500);
      }
    } catch (error) {
      console.error(`Error assigning to ${user}:`, error);
      toast.error(`Error assigning to ${user}`);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleTicketAction = async (action) => {
    const actionsConfig = {
      settle: {
        actionText: "settle",
        confirmationText: "Are you sure you want to settle this ticket?",
        endpoint: "/createTickets/settlement",
      },
      reopen: {
        actionText: "request to reopen",
        confirmationText: "Are you sure you want to request reopening this ticket?",
        endpoint: "/createTickets/request-reopen",
      },
    };

    const config = actionsConfig[action];
    if (!config) return;

    const capitalizeActionText = (text) =>
      text.charAt(0).toUpperCase() + text.slice(1);

    try {
      const { isConfirmed } = await Swal.fire({
        title: `Confirm ${capitalizeActionText(config.actionText)}`,
        text: config.confirmationText,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E10174",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, ${config.actionText} it!`,
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
        text: `There was an error ${config.actionText}ing the ticket.`,
        confirmButtonColor: "#E10174",
      });
    }
  };

  const handlePostActionNavigation = (action) => {
    const navigateTo =
      action === "settle"
        ? department === "District Manager"
          ? "/completed"
          : department === "SuperAdmin"
          ? "/SuperAdminHome"
          : departments.includes(department)
          ? "/departmentcompleted"
          : "/"
        : action === "reopen" && department === "Employee"
        ? "/home"
        : "/";
    if (navigateTo !== "/") {
      setTimeout(() => {
        dispatch(setId(storedId));
        dispatch(fetchIndividualTickets(storedId));
        navigate(navigateTo);
      }, 1500);
    }
  };

  const handleConfirmSettled = () => handleTicketAction("settle");
  const handleRequestReopen = () => handleTicketAction("reopen");

  const handleCallbackAction = async () => {
    setStatusLoading(true);
    const department = "District Manager";
    try {
      const { status } = await apiRequest.put(
        `/createTickets/callback/?department=${department}&ticketId=${markets.ticketId}&usersId=${usersId}`
      );
      if (status === 200) {
        toast.success(`Assigned to ${department}`);
        await updateTicketStatus("2");
        setTimeout(() => navigate("/openedTickets"), 1500);
      }
    } catch (error) {
      console.error(`Error assigning to ${department}:`, error);
      toast.error(`Error assigning to ${department}`);
    } finally {
      setSelectedDepartment("");
      setStatusLoading(false);
    }
  };

  const handleImageClick = (url) => window.open(url, "_blank", "noopener,noreferrer");

  const counts = getcomment.reduce((acc, comment) => (comment.createdBy === fname ? acc + 1 : acc), 0);
  const canRequestReopen =
    counts >= 1 &&
    department === "Employee" &&
    markets.status?.name === "completed" &&
    !markets.requestreopen;

  if (loading || statusLoading) {
    return (
     
        <div className="loader" role="status"></div>
      
    );
  }

  return (
    <div className="ticket-details-container container-fluid mt-2">
      <h5 className="ticket-title mb-1">Ticket ID: <span>{markets.ticketId || "N/A"}</span></h5>
      {markets ? (
        <div className="ticket-card border rounded p-5 bg-white shadow-sm">
          <div className="row">
            {/* Ticket Details */}
            <div className="col-md-8">
              <div className="row">
                {Object.entries({
                  Email: markets.ntid || "",
                  "Full Name": markets.fullname || "",
                  Market: markets.market || "",
                  "Selected Store": markets.selectStore || "",
                  "Phone Number": markets.phoneNumber || "",
                  "Ticket Regarding": markets.ticketRegarding || "",
                  "Selected Department": markets.selectedDepartment || "",
                  "Selected Sub Department": markets.selectedSubdepartment || "",
                  Description: markets.description || "",
                  "Created At": formatDate(markets.createdAt) || "",
                }).map(([key, value]) => (
                  <div className="col-md-6 " key={key}>
                    <h6 className="ticket-label">{key}</h6>
                    <p className="ticket-value">{value || "N/A"}</p>
                  </div>
                ))}
              </div>
              {/* Comments Section */}
              <div className="comments-section mt-3">
                <h5 className="comments-title">Comments:</h5>
                {getcomment.length > 0 ? (
                  getcomment
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((comment, index) => (
                      <div key={index} className="comment-item mb-2">
                        <p className="comment-text">
                          <HiArrowSmRight /> {comment.comment}
                        </p>
                        <small className="comment-meta">
                          Commented By: <span>{comment.createdBy}</span> | {formatDate(comment.createdAt)}
                        </small>
                        {comment.commentedfiles && (
                          <div className="comment-files mt-1">
                            {comment.commentedfiles.map((item, fileIndex) => {
                              const fileName = item.split("/").pop();
                              const shortName = fileName.length > 20 ? `${fileName.substring(0, 17)}...` : fileName;
                              return (
                                <a
                                  key={fileIndex}
                                  href={item}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="comment-file-link"
                                >
                                  <span>{shortName}</span>
                                  <img src={item} alt={`file-${fileIndex}`} className="comment-file-preview" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-muted">No comments available.</p>
                )}
              </div>
            </div>
            {/* Image Carousel */}
            <div className="col-md-4 text-center">
              <div className="image-card shadow-sm rounded">
                {uploadedFileUrl.length > 0 ? (
                  <Carousel className="ticket-carousel">
                    {uploadedFileUrl.map((url, index) => (
                      <Carousel.Item key={index}>
                        <img
                          src={url}
                          alt={`Ticket File ${index + 1}`}
                          className="d-block w-100 ticket-image"
                          onClick={() => handleImageClick(url)}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div className="no-image-placeholder">
                    <FaImage size={50} className="mb-2 text-pink" />
                    <p className="text-muted">No Images Available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Actions and Comment Input */}
          <div className="row mt-3">
            <div className="col-7">
              {(department !== "Employee" || (department === "Employee" && markets.status?.name === "completed")) && (
                <Comment
                  commentLoading={commentLoading}
                  comment={comment}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  handleCommentChange={handleCommentChange}
                  handleSubmit={handleSubmit}
                />
              )}
            </div>
            <div className="col-5 d-flex justify-content-end align-items-center flex-wrap gap-2">
              {departments?.includes(department) && markets.status?.name !== "completed" && (
                <Dropdown className="allocate-dropdown">
                  <Dropdown.Toggle variant="pink" id="dropdown-allocate">
                    Allocate
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-scroll">
                    {users.sort().map((user, index) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => onhandleAllot(user.fullname)}
                        className="dropdown-item-pink"
                      >
                        {user.fullname}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              )}
              {department !== "Employee" && department !== "SuperAdmin" && markets.usersId !== usersId && (
                <>
                  {markets.status?.name !== "completed" && markets.departmentId === "19" && (
                    <Dropdown className="assign-dropdown">
                      <Dropdown.Toggle variant="pink" id="dropdown-assign">
                        Assign to
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="dropdown-menu-scroll">
                        {departments.sort().map((dept, index) => (
                          <Dropdown.Item
                            key={index}
                            onClick={() => onhandleDepartment({ target: { value: dept } })}
                            className="dropdown-item-pink"
                          >
                            {dept}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                  {markets.status?.name !== "completed" &&
                    (markets.departmentId === "19" || departments.includes(department)) && (
                      <Button variant="success" onClick={() => handleConfirmAction("4", "mark as completed")}>
                        Close
                      </Button>
                    )}
                </>
              )}
              {canRequestReopen && (
                <Button variant="pink" onClick={handleRequestReopen}>
                  Request Reopen
                </Button>
              )}
              {counts >= 1 && department !== "Employee" && markets.status?.name === "completed" && subDepartment !== "User" && (
                <Button variant="pink" onClick={() => handleConfirmAction("5", "reopened")}>
                  Reopen
                </Button>
              )}
              {department !== "Employee" && markets.status?.name === "completed" && subDepartment !== "User" && !markets.isSettled && (
                <Button variant="success" onClick={handleConfirmSettled}>
                  Settle
                </Button>
              )}
              {(department === "District Manager" || department === "Market Manager") &&
                markets.departmentId !== "19" &&
                markets.status?.name !== "completed" &&
                markets.userId !== usersId && (
                  <Button variant="success" onClick={handleCallbackAction}>
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
        <p className="reopen-note text-danger mt-2">
          * Enter comment describing the purpose of reopening the ticket before requesting reopen
        </p>
      )}
      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
};

export default Individualmarketss;