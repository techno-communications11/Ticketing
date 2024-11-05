import React, { useState, useEffect } from "react";
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

const Individualmarketss = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { markets, loading } = useSelector((state) => state.market);
  const selectedId = useSelector((state) => state.market.selectedId);
  const [comment, setComment] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [getcomment, setGetComment] = useState([]);
  const [users, setUsers] = useState([]);
  const departments = [
    "NTID Mappings",
    "Trainings",
    "Accessories Order",
    "YUBI Key Setups",
    "Charge Back/Commission",
    "Inventory",
    "Admin/Supplies/License/Utilities/Permits/Internet/Telephone/LoomisTechnical/Electricity",
    "Maintenance",
    "Housing",
    "CAM NW",
    "HR Payroll",
  ];

  const { ntid: userNtid, department, fullname } = getDecodedToken() || {};
  console.log(department, "depty");

  const fetchData = async () => {
    try {
      const response = await apiRequest.get("/auth/GetUsers");
      console.log("API Response:", response);
      const fetchedUsers = response.data.teamMembers || [];
      const filterdata = fetchedUsers.filter(
        (name) => name.fullname !== fullname
      );
      setUsers(filterdata);
      if (filterdata.length > 0) {
      } else {
        console.log("No users found in your team");
      }
    } catch (error) {
      console.error("Error fetching users:", error.response || error.message);
    }
  };

  useEffect(() => {
    const storedId = localStorage.getItem("selectedId");
    if (storedId) {
      const fetchComments = async () => {
        try {
          const response = await apiRequest.get(
            `/createTickets/getcomment/?ticketId=${storedId}`
          );
          setGetComment(response.data);
        } catch (err) {
          console.log("Error fetching comments.", err);
        }
      };
      fetchComments();
    }
  }, [markets.ticketId]);

  useEffect(() => {
    const storedId = localStorage.getItem("selectedId");
    if (storedId && (!selectedId || selectedId !== storedId)) {
      dispatch(setId(storedId));
      dispatch(fetchIndividualTickets(storedId));
    }
  }, [selectedId, dispatch]);

  useEffect(() => {
    if (markets?.files) {
      try {
        const filesObj = JSON.parse(markets.files);
        const cameraFile = filesObj.cameraFile; // Change to access cameraFile
        const fileName = filesObj.fileSystemFile; 
        // Log the parsed files object for debugging
        console.log('Parsed Files Object:', filesObj);
  
        // Ensure the cameraFile is correctly formatted
        if (fileName||cameraFile) {
          const formattedUrl = `http://192.168.1.27:4000/${cameraFile.replace(/\\/g, "/")}`;
          console.log('File URL:', formattedUrl); // Log the constructed URL for debugging
          setUploadedFileUrl(formattedUrl);
        } else {
          console.warn('Camera file not found in the files object.');
          setUploadedFileUrl(null);
        }
      } catch (error) {
        console.error('Error parsing files JSON:', error);
        setUploadedFileUrl(null);
      }
    }
  }, [markets]);
  
  

  const updateOpenedBy = async () => {
    try {
      const endpoint =
        departments?.includes(department) ||
        department === "Maintenance_Head" ||
        department === "Admin_Head"
          ? "/createTickets/update_opened_by"
          : "";
      const response = await apiRequest.put(endpoint, {
        ticketId: markets.ticketId,
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
      if (markets.ntid !== userNtid && department !== "SuperAdmin") {
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
        `/createTickets/updateprogress/?statusId=${statusId}&ticketId=${markets.ticketId}`
      );
      if (statusId === "4" && response.status === 200) {
        toast.success("Ticket marked as completed!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => {
          if (department === "Market Manager") {
            navigate("/markethome");
          }
          if (department?.includes(department)) {
            navigate("/departmenthome");
          }
          if (department === "District Manager") {
            navigate("/completed");
          } else {
            navigate("/details");
          }
          window.location.reload();
        }, [2000]);
      }

      if (statusId === "5" && response.status === 200) {
        toast.success("Ticket marked as reopened!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => {
          window.location.reload();
        }, [2000]);
      }
      if (statusId === "3" && response.status === 200) {
        toast.success("Ticket status updated!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => {
          navigate("/openedTickets");
          window.location.reload();
        }, [2000]);
      }
    } catch (error) {
      console.error(`Error updating ticket status to ${statusId}:`, error);
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
    try {
      const response = await apiRequest.put("/createTickets/postcomment", {
        ticketId: markets.ticketId,
        comment: comment,
        createdBy: fullname,
      });
      if (response.status === 200) {
        setComment("");
        toast.success("comment submitted!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => {
          window.location.reload();
        }, [2000]);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const onhandleDepartment = (e) => {
    const selectedDept = e.target.value || selectedDepartment;
    console.log(selectedDept, "soluted");
    setSelectedDepartment(selectedDept);
    assignToDepartment(selectedDept);
  };

  const assignToDepartment = async (selectedDept) => {
    try {
      const response = await apiRequest.put(
        `/createTickets/assigntodepartment/?department=${selectedDept}&ticketId=${markets.ticketId}&ntid=${userNtid}`
      );
      if (response.status === 200) {
        toast.success(`assigned to ${selectedDept}`);
        updateTicketStatus("3");
        setTimeout(() => {
          window.location.reload();
        }, [2000]);
      }
    } catch (error) {
      toast.error(`error assigning to ${selectedDept}`);
    } finally {
      setSelectedDepartment("");
    }
  }

  const onhandleAllot = async (user) => {
    try {
      const response = await apiRequest.put("/createTickets/alloted", {
        user,
        ticketId: markets.ticketId,
      });
      if (response.status === 200) {
        toast.success(`assigned to ${user}`);
        updateTicketStatus("3");
      }
    } catch (error) {
      toast.error(`error assigning to ${user}`);
    } finally {
      setSelectedDepartment("");
    }
  };

  const handleTicketAction = async (action) => {
    const actionText = action === "settle" ? "settle" : "request to reopen";
    const confirmationText =
      action === "settle"
        ? "Are you sure you want to settle this ticket?"
        : "Are you sure you want to request reopening this ticket?";

    const { isConfirmed } = await Swal.fire({
      title: `Confirm ${
        actionText.charAt(0).toUpperCase() + actionText.slice(1)
      }`,
      text: confirmationText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E10174",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${actionText} it!`,
      cancelButtonText: "Cancel",
    });

    if (isConfirmed) {
      try {
        const endpoint =
          action === "settle"
            ? "/createTickets/settlement"
            : "/createTickets/request-reopen";
        const response = await apiRequest.put(endpoint, {
          ticketId: markets.ticketId,
        });

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: `Ticket ${actionText}d`,
            text: `The ticket has been ${actionText}d successfully.`,
            confirmButtonColor: "#E10174",
          });

          if (department === "District Manager" && action === "settle") {
            navigate("/completed");
          }
          if (department === "Employee" && action === "reopen") {
            navigate("/home");
          }
        }
      } catch (error) {
        console.error(`Error requesting ${actionText}:`, error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `There was an error ${actionText}ing the ticket. Please try again.`,
          confirmButtonColor: "#E10174",
        });
      }
    }
  };
  const handleConfirmSettled = () => handleTicketAction("settle");
  const handleRequestReopen = () => handleTicketAction("reopen");

  const handleCallbackAction = async() => {
    try {
      const response = await apiRequest.put(
        `/createTickets/callback/?department=${'District Manager'}&ticketId=${markets.ticketId}`
      );
      if (response.status === 200) {
        toast.success(`assigned to ${'District Manager'}`);
        // updateTicketStatus("3");
        setTimeout(() => {
          window.location.reload();
        }, [2000]);
      }
    } catch (error) {
      toast.error(`error assigning to ${'District Manager'}`);
    } finally {
      setSelectedDepartment("");
    }
  };
  let counts = getcomment.reduce((acc, comment) => {
    if (comment.createdBy === markets.fullname) {
      acc++;
    }
    return acc;
  }, 0);

  console.log("request reop", markets);

  return (
    <div className="container mt-2">
      <h5
        className="mb-3 font-family text-start"
        style={{ color: "#E10174", fontWeight: "bold" }}
      >
        Ticket Details Of Id:
        <span className="fs-5 fs-md-3 text-primary text-wrap ms-2">
          {markets.ticketId || "No ticket details available"}
        </span>
      </h5>

      {markets ? (
        <div className="row border bg-white rounded p-2">
          <div className="col-md-8">
            <div className="row">
              {Object.entries({
                NTID: markets.ntid,
                "Full Name": markets.fullname,
                Market: markets.market,
                "Selected Store": markets.selectStore,
                "Phone Number": markets.phoneNumber,
                "Ticket Regarding": markets.ticketRegarding,
                Description: markets.description,
                "Created At": formatDate(markets.createdAt),
              }).map(([key, value]) => (
                <div className="col-md-6 mb-2" key={key}>
                  <h6 className="card-subtitle mb-1 text-muted fw-medium">
                    {key}
                  </h6>
                  <p className="card-text">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-2 mb-2 col-md-12">
              <h5 className="text-start fw-bold text-secondary">Comments:</h5>
              {getcomment.length > 0 ? (
                getcomment
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
                        <span className="fw-medium"> {comment.createdBy}</span>{" "}
                        | {formatDate(comment.createdAt)}
                      </small>
                    </div>
                  ))
              ) : (
                <p>No comments available for this ticket.</p>
              )}
            </div>
          </div>

          <div className="col-md-4 mb-3 text-center">
            <div className="card shadow-sm rounded">
              {uploadedFileUrl ? (
                <img
                  src={uploadedFileUrl}
                  alt="Ticket File"
                  className="card-img-top img-thumbnail cursor-pointer image-fluid"
                  onClick={() => setShowModal(true)}
                  style={{
                    height: "250px",
                    objectFit: "contain",
                    width: "100%",
                  }} // Adjust image size
                />
              ) : (
                <div
                  className="card-img-top img-thumbnail text-center d-flex justify-content-center align-items-center"
                  style={{ height: "250px", width: "100%" }}
                >
                  <span>No Image</span>
                </div>
              )}
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-md-7 d-flex align-items-center">
              {department !== "Employee" &&
                department !== "SuperAdmin" &&
                markets.ntid !== userNtid &&
                markets.status?.name !== "completed" && (
                  <Comment
                    comment={comment}
                    handleCommentChange={handleCommentChange}
                    handleSubmit={handleSubmit}
                  />
                )}
              {(department === "Employee" ||
                department === "District Manager") &&
                markets.status?.name === "completed" && (
                  <Comment
                    comment={comment}
                    handleCommentChange={handleCommentChange}
                    handleSubmit={handleSubmit}
                  />
                )}
            </div>

            <div className="col-md-5 d-flex justify-content-end align-items-center mt-4 text-sm-start ">
              {(departments?.includes(department) ||
                department === "Maintenance_Head" ||
                department === "Admin_Head") &&
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
                          className="shadow-lg text-primary text-capitalize"
                        >
                          {user.fullname}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              {department !== "Employee" &&
                department !== "SuperAdmin" &&
                markets.ntid !== userNtid && (
                  <>
                    {markets.status?.name !== "completed"&& markets.departmentId==='19' && (
                      <Dropdown className="mx-2">
                        <Dropdown.Toggle variant="primary" id="dropdown-basic">
                          Assign to
                        </Dropdown.Toggle>
                        <Dropdown.Menu
                          style={{
                            height: "350px",
                            overflow: "scroll",
                            width: "50vw",
                          }}
                        >
                          {departments
                            .sort()
                            .filter((dept) => {
                              if (
                                department === "Maintenance_Head" &&
                                dept === "Maintenance"
                              )
                                return false;
                              if (
                                department === "Admin_Head" &&
                                dept === "Admin"
                              )
                                return false;
                              if (dept === department) return false;
                              return true;
                            })
                            .map((dept, index) => (
                              <Dropdown.Item
                                key={index}
                                onClick={() =>
                                  onhandleDepartment({
                                    target: { value: dept },
                                  })
                                }
                                className="shadow-lg text-primary"
                              >
                                {dept}
                              </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
                    {department === "District Manager" &&
                      markets.departmentId !== "19"&&markets.
                      requestreopen===null && (
                        <button
                          className="btn btn-success me-2"
                          onClick={() => handleCallbackAction()}
                        >
                          Call Back
                        </button>
                      )}
                    {department === "District Manager" &&
                    markets.status?.name !== "completed" &&
                    markets.departmentId === "19" ? (
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          handleConfirmAction("4", "mark as completed")
                        }
                      >
                        Close
                      </button>
                    ) : (
                      <></>
                    )}
                    {department !== "District Manager" &&
                    markets.status?.name !== "completed" &&
                    markets.departmentId !== "19" ? (
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          handleConfirmAction("4", "mark as completed")
                        }
                      >
                        Close
                      </button>
                    ) : (
                      <></>
                    )}
                  </>
                )}
              {counts >= 1 &&
                department === "Employee" &&
                markets.status?.name === "completed" && (
                  <Button
                    variant="primary fw-medium w-auto ms-auto me-3 "
                    onClick={() => handleRequestReopen()}
                    key={comment.id}
                  >
                    Request Reopen
                  </Button>
                )}

              {(department === "District Manager" ||
                department === "Market Manager" ||
                department === "SuperAdmin") &&
                markets.status?.name === "completed" &&
                !markets.isSettled && (
                  <Button
                    variant="primary fw-medium w-auto me-2 "
                    onClick={() => handleConfirmAction("5", "reopened")}
                  >
                    Reopen
                  </Button>
                )}
              {department === "District Manager" &&
                markets.status?.name === "completed" &&
                !markets.isSettled && (
                  <Button
                    variant="success fw-medium w-auto"
                    onClick={handleConfirmSettled}
                  >
                    Settled
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
          <img src={uploadedFileUrl} alt="Ticket File" className="img-fluid" />
        </Modal.Body>
      </Modal>
      {department === "Employee" && markets.status?.name === "completed" && (
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
