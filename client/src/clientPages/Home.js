import React, { useState, useRef } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineCloudUpload } from "react-icons/md";
import { apiRequest } from "../lib/apiRequest";
import { useEffect } from "react";
import { animateValue } from "../universalComponents/AnnimationCount";
import { setUserAndStatus, fetchStatusTickets } from "../redux/userStatusSlice";
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Card } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import getDecodedToken from "../universalComponents/decodeToken";
import { useMyContext } from "../universalComponents/MyContext";

export function Home() {
  const [show, setShow] = useState(false);
  const [popButtons, setPopButtons] = useState(false);
  const [cameraFileName, setCameraFileName] = useState([]);
  const [fileSystemFileName, setFileSystemFileName] = useState([]);
  const [selectedStore, setSelectedStore] = useState("Select Store");
  const [selectedDepartment, setSelectedDepartment] =useState("Select Department");
  const [userData, setUserData] = useState("");
  const [TicketsCount, setTicketsCount] = useState(0);
  const { ntid } = getDecodedToken();
  const { setNtid } = useMyContext();
  const [searchStore, setSearchStore] = useState("");
  const [filteredStores, setFilteredStores] = useState(userData?.stores || []);
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const admin = [
    "Internet",
    "Power",
    "Gas",
    "Water & Sewer",
    "Alarm",
    "Dumpster",
    "Alarm Permit",
    "Camera Setup",
    "Shopper Trak",
    "Store Email ID",
    "Phone Line",
    "GPS Tracker",
    "Ordering",
    "Other",
  ];
  const [filteredSubDepartments, setFilteredSubDepartments] = useState(admin);
  const [searchSubDepartment, setSearchSubDepartment] = useState("");

  const Departments = [
    // "NTID Mappings",
    // "Trainings",
    // "Accessories Order",
    // "YUBI Key Setups",
    // "Charge Back/Commission",
    // "Inventory",
    "Admin",
    // "Maintenance ",
    // "Housing ",
    // "CAM NW",
    // "HR Payroll",
  ];

  const [searchDepartment, setSearchDepartment] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState(Departments);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    ntid: "",
    phone: "",
    store: "",
    market: "",
    ticketSubject: "",
    department: "",
    description: "",
  });
  const ntidRef = useRef(null);
  const phoneRef = useRef(null);
  const ticketSubjectRef = useRef(null);
  const descriptionRef = useRef(null);
  const marketRef = useRef(null);
  const fullnameRef = useRef("");

  const handleClose = () => {
    setShow(false);
    setCameraFileName(null);
    setFileSystemFileName(null);
    setErrors({
      ntid: "",
      phone: "",
      store: "",
      ticketSubject: "",
      description: "",
      market: "",
      fullname: "",
    });
    setSelectedStore("Select Store");
    setSelectedDepartment("select Department");
  };

  const handleShow = useCallback(() => {
    setShow(true);
    setPopButtons(false);
  }, [setShow, setPopButtons]);

  useEffect(() => {}, [handleShow]);

  useEffect(() => {
    if (searchSubDepartment) {
      const filtered = admin.filter((admin) =>
        admin.toLowerCase().includes(searchSubDepartment.toLowerCase())
      );
      setFilteredSubDepartments(filtered);
    } else {
      setFilteredSubDepartments(admin || []);
    }
  }, [searchSubDepartment, admin]);

  useEffect(() => {
    if (searchDepartment) {
      const filtered = Departments.filter((department) =>
        department.toLowerCase().includes(searchDepartment.toLowerCase())
      );
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments(Departments);
    }
  }, [searchDepartment]);

  const handleCameraChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFiles =
      selectedFiles.length +
      (cameraFileName?.length || 0) +
      (fileSystemFileName?.length || 0);

    // Only proceed if the total selected files are 5 or fewer
    if (totalFiles <= 5) {
      setCameraFileName((prev) => [...(prev || []), ...selectedFiles]);
    } else {
      alert("You can select up to 5 files in total.");
    }
  };

  const handleFileSystemChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFiles =
      selectedFiles.length +
      (cameraFileName?.length || 0) +
      (fileSystemFileName?.length || 0);

    // Only proceed if the total selected files are 5 or fewer
    if (totalFiles <= 5) {
      setFileSystemFileName((prev) => [...(prev || []), ...selectedFiles]);
    } else {
      alert("You can select up to 5 files in total.");
    }
  };

  // Safely get the total selected files count with optional chaining
  const filesSelected =
    (cameraFileName?.length || 0) + (fileSystemFileName?.length || 0);

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setSearchStore("");
  };
  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setSearchDepartment("");
  };

  const handleNTIDBlur = async () => {
    try {
      const response = await apiRequest.get("/profile/getprofiledata_ntid");
      if (response.status === 200) {
        setUserData(response.data);
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          ntid: "User not found or error fetching data",
        }));
      }
    } catch (error) {
      if (error.response) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          ntid: error.response.data.message || "Invalid NTID entered",
        }));
      } else if (error.request) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          ntid: "No response from server. Please try again later.",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          ntid: "Error occurred. Please try again.",
        }));
      }
    }
  };

  const fetchTicketCounts = async () => {
    try {
      const response = await apiRequest.get("/createTickets/countusertickets", {
        params: { ntid },
      });
      // console.log("Initial ticket count response:", response);
      setTicketsCount(response.data);
    } catch (error) {
      // toast.error("Failed to fetch ticket counts");
    }
  };

  useEffect(() => {
    handleNTIDBlur();
    fetchTicketCounts();
  }, [handleShow]);

  const validateForm = () => {
    const newErrors = {
      ntid: "",
      fullname: "",
      phone: "",
      store: "",
      ticketSubject: "",
      description: "",
      market: "",
      department: "",
    };
  
    const ntid = ntidRef.current.value;
    const phone = phoneRef.current.value;
    const ticketSubject = ticketSubjectRef.current.value;
    const description = descriptionRef.current.value;
    const market = marketRef.current.value;
    const fullname = fullnameRef.current.value;
  
    if (!ntid) newErrors.ntid = "NTID is required";
    if (!phone) newErrors.phone = "Phone number is required";
    if (selectedStore === "Select Store") newErrors.store = "Store selection is required";
    if (!ticketSubject) newErrors.ticketSubject = "Ticket subject is required";
    if (!description) newErrors.description = "Description is required";
    if (!market) newErrors.market = "Select market";
    if (!fullname) newErrors.fullname = "Full name is required";
    if (selectedDepartment === "Select Department") newErrors.ticketDepartment = "Department is required";
  
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };
  
  const appendFilesToFormData = (formData) => {
    // Append files from both arrays
    [cameraFileName, fileSystemFileName].forEach((fileArray, index) => {
      fileArray?.forEach((file) => {
        formData.append(index === 0 ? "cameraFile" : "fileSystemFile", file);
      });
    });
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      const formData = new FormData();
      const ntid = ntidRef.current.value;
      const phone = phoneRef.current.value.replace(/[^0-9]/g, "").slice(-10); // Clean phone number
  
      // Append form fields
      formData.append("ntid", ntid);
      formData.append("phone", phone);
      formData.append("store", selectedStore);
      formData.append("ticketSubject", ticketSubjectRef.current.value);
      formData.append("description", descriptionRef.current.value);
      formData.append("market", marketRef.current.value.toLowerCase());
      formData.append("fullname", fullnameRef.current.value);
      formData.append("department", selectedDepartment);
      formData.append("subdepartment", selectedSubDepartment);
  
      // Append files (camera and system files)
      appendFilesToFormData(formData);
  
      setLoading(true);
  
      // Send the form data using the API request
      apiRequest
        .post("/createTickets/uploadTicket", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          toast.success("Ticket created successfully!");
          handleClose();
          fetchTicketCounts();
          setLoading(false);
        })
        .catch((error) => {
          const errorMsg = error.response?.data?.message || "Error occurred. Please try again.";
          setErrors((prevErrors) => ({
            ...prevErrors,
            ntid: errorMsg,
          }));
          toast.error(errorMsg);
          setLoading(false);
        });
    }
  };
  

  useEffect(() => {
    const objTotal = document.getElementById("Totalvalue");
    const objNew = document.getElementById("Newvalue");
    const objOpened = document.getElementById("Openedvalue");
    const objInProgress = document.getElementById("Inprocessvalue");
    const objCompleted = document.getElementById("Completedvalue");
    const objreopened = document.getElementById("reOpenedvalue");
    const totalTickets =
      (TicketsCount.reopened || 0) +
      (TicketsCount.new || 0) +
      (TicketsCount.opened || 0) +
      (TicketsCount.inprogress || 0) +
      (TicketsCount.completed || 0);
    if (objTotal) {
      animateValue(objTotal, 0, totalTickets, 500);
    }
    if (objNew) {
      animateValue(objNew, 0, TicketsCount.new || 0, 500);
    }
    if (objOpened) {
      animateValue(objOpened, 0, TicketsCount.opened || 0, 500);
    }
    if (objInProgress) {
      animateValue(objInProgress, 0, TicketsCount.inprogress || 0, 500);
    }
    if (objCompleted) {
      animateValue(objCompleted, 0, TicketsCount.completed || 0, 500);
    }
    if (objreopened) {
      animateValue(objreopened, 0, TicketsCount.reopened || 0, 500);
    }
    if (totalTickets > 0) {
      TicketsCount.Ticket = totalTickets;
    }
  }, [TicketsCount]);

  const handleDataSend = (statusId, ntid) => {
    localStorage.setItem("statusData", statusId);
    dispatch(fetchStatusTickets({ statusId, ntid }));
    dispatch(setUserAndStatus({ statusId, ntid }));
  };

  const handleNew = () => handleDataSend("1", ntid);
  const handleOpened = () => handleDataSend("2", ntid);
  const handleInprogress = () => handleDataSend("3", ntid);
  const handleCompleted = () => handleDataSend("4", ntid);
  const handleReOpened = () => handleDataSend("5", ntid);

  const handleSubDepartmentSelect = (department) => {
    setSelectedSubDepartment(department);
    setSearchSubDepartment("");
  };

  const handleTotalTickets = (AdminsDatantid) => () => {
    // console.log(AdminsDatantid, "ooooooooo");
    setNtid(AdminsDatantid);
    localStorage.setItem('adminntid',AdminsDatantid)

    if (AdminsDatantid) {
      navigate("/totalusertickets");
    } else {
      console.error("NTID is not available");
    }
  };
  const filteredInsights = Object.entries(TicketsCount).filter(
    ([key]) => key !== "Ticket"
  );

  const chartData = {
    labels: filteredInsights.map(([key]) => key), // Extracting keys for labels
    datasets: [
      {
        data: filteredInsights.map(([, value]) => value), // Correctly extracting values for data
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };
  useEffect(() => {
    if (searchStore) {
      const filtered =
        userData?.stores?.filter((store) =>
          store.toLowerCase().includes(searchStore.toLowerCase())
        ) || [];
      setFilteredStores(filtered);
    } else {
      setFilteredStores(userData?.stores || []);
    }
  }, [searchStore, userData]);
  // console.log(userData.stores, "ppppppppp");

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Ticket Counts by Status",
      },
    },
    animation: {
      duration: 500, // Animation duration in milliseconds (default is 1000ms)
      easing: "easeOutQuad", // Easing function for a smoother and faster animation
    },
  };
  

  return (
    <div>
        <Modal show={show} onHide={handleClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Enter Ticket Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group
                className="mb-1 d-flex align-items-center"
                controlId="formBasicNTID"
              >
                <Form.Control
                  className="shadow-none text-secondary fw-medium boorder-0"
                  type="text"
                  placeholder="Enter NTID"
                  value={userData?.ntid || ""}
                  isInvalid={!!errors.ntid}
                  ref={ntidRef}
                  readOnly
                />
              </Form.Group>
              <Form.Group
                className="mb-1 d-flex gap-1 flex-wrap"
                controlId="formPhoneNumber"
              >
                <div className="flex-grow-1 mb-1 mb-md-0">
                  <Form.Control
                    className="fw-medium text-secondary shadow-none boorder-0 text-capitalize"
                    type="text"
                    value={userData?.fullname || ""}
                    placeholder="Full Name"
                    ref={fullnameRef}
                    readOnly
                  />
                </div>
                <div className="d-flex flex-grow-1 align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="Enter Phone Number"
                    isInvalid={!!errors.phone}
                    ref={phoneRef}
                    className="shadow-none text-secondary fw-medium border"
                  />
                </div>
              </Form.Group>
              <Form.Group
                className="mb-1 d-flex gap-1 flex-wrap"
                controlId="store"
              >
                <div className="flex-grow-1 mb-1 mb-md-0 ">
                  <Form.Control
                    ref={marketRef}
                    className="text-secondary fw-medium shadow-none boorder-0 text-capitalize"
                    type="text"
                    placeholder="market"
                    value={userData.market?.market || ""}
                    readOnly
                  />
                </div>
                <Dropdown className="flex-grow-1" id="dropdown-store">
                  <Dropdown.Toggle
                    className={`text-start bg-white fw-medium text-secondary border shadow-none w-100`}
                    id="dropdown-basic"
                  >
                    {selectedStore || "Select a Store"}{" "}
                    {/* Placeholder if no store is selected */}
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    style={{ height: "42vh", overflow: "scroll" }}
                    className="col-12 col-md-12"
                  >
                    <input
                      onChange={(e) => setSearchStore(e.target.value)}
                      placeholder="Search Stores..."
                      className="w-75 form-control border text-muted fw-medium shadow-none text-center mb-2 ms-2"
                    />
                    {filteredStores?.length > 0 ? (
                      filteredStores.sort().map((store, index) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => handleStoreSelect(store)}
                          className="shadow-lg fw-medium text-primary text-start"
                          isInvalid={!!errors.store}
                        >
                          {store}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled className="text-muted text-start">
                        No stores found
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>

              <Form.Group controlId="ticketDepartment">
                <Dropdown className="flex-grow-1 mb-1" id="dropdown-department">
                  <Dropdown.Toggle
                    className={`text-start bg-white fw-medium text-secondary border shadow-none w-100`}
                    id="dropdown-basic"
                  >
                    {selectedDepartment || "Select a Department"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    style={{ height: "42vh", overflow: "scroll" }}
                    className="col-12 col-md-12"
                  >
                    <input
                      onChange={(e) => setSearchDepartment(e.target.value)}
                      placeholder="Search Departments..."
                      className="w-75 form-control border text-muted fw-medium shadow-none text-center mb-2 ms-2"
                    />
                    {filteredDepartments?.length > 0 ? (
                      filteredDepartments.map((department, index) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => handleDepartmentSelect(department)}
                          className="shadow-lg fw-medium text-primary text-start"
                          isInvalid={!!errors.department}
                        >
                          {department}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled className="text-muted text-start">
                        No departments found
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
                {selectedDepartment === "Admin" && (
                  <div>
                    <Dropdown
                      className="flex-grow-1 mb-1"
                      id="dropdown-department"
                    >
                      <Dropdown.Toggle
                        className={`text-start fw-medium bg-white fw-medium text-secondary border shadow-none w-100`}
                        id="dropdown-basic"
                      >
                        {selectedSubDepartment || "Select Sub Department"}
                      </Dropdown.Toggle>
                      <Dropdown.Menu
                        style={{ height: "42vh", overflow: "scroll" }}
                        className="col-12 col-md-12"
                      >
                        <input
                          onChange={(e) => setSearchSubDepartment(e.target.value)}
                          placeholder="Search Sub Departments..."
                          className="w-75 form-control border fw-mediumer text-muted fw-medium shadow-none text-center mb-2 ms-2"
                        />
                        {filteredSubDepartments?.length > 0 ? (
                          filteredSubDepartments.map((department, index) => (
                            <Dropdown.Item
                              key={index}
                              onClick={() =>
                                handleSubDepartmentSelect(department)
                              }
                              className="shadow-lg fw-medium  fw-medium text-primary text-start"
                              isInvalid={!!errors.department}
                            >
                              {department}
                            </Dropdown.Item>
                          ))
                        ) : (
                          <Dropdown.Item
                            disabled
                            className="text-muted text-start"
                          >
                            No departments found
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                )}
              </Form.Group>

              <Form.Group
                className="mb-1 d-flex align-items-center "
                controlId="formTicketSubject"
              >
                <Form.Control
                  type="text"
                  className="shadow-none fw-medium text-secondary boorder-0"
                  placeholder="Ticket regarding"
                  isInvalid={!!errors.ticketSubject}
                  ref={ticketSubjectRef}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="formDescription">
                <Form.Control
                  className="shadow-none text-secondary  fw-medium boorder-0"
                  as="textarea"
                  placeholder="Enter description"
                  rows={3}
                  isInvalid={!!errors.description}
                  ref={descriptionRef}
                />
              </Form.Group>
              <Form.Group className="mb-1" controlId="fileUpload">
                <div>
                  <div>
                    <div>
                      <div
                        className="border text-center"
                        onClick={() => setPopButtons(true)} // Open the file input options
                        style={{ height: "80px", cursor: "pointer" }}
                      >
                        {filesSelected > 0 ? (
                          <div className="mt-4">
                            {cameraFileName?.length > 0 && (
                              <p className="fw-medium text-secondary mt-2">
                                {cameraFileName?.length} camera file(s) selected
                              </p>
                            )}
                            {fileSystemFileName?.length > 0 && (
                              <p className="fw-medium text-secondary mt-2">
                                {fileSystemFileName?.length} file(s) selected
                              </p>
                            )}
                          </div>
                        ) : popButtons ? (
                          <div className="rounded ">
                            <label className="btn border-secondary btn-outline-secondary fw-medium mt-3 me-2">
                              Camera
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                multiple
                                style={{ display: "none" }}
                                onChange={handleCameraChange}
                                disabled={
                                  cameraFileName?.length +
                                    fileSystemFileName?.length >=
                                  5
                                } // Disable if total files >= 5
                              />
                            </label>
                            <label className="btn border-secondary btn-outline-secondary fw-medium mt-3">
                              Browse
                              <input
                                type="file"
                                multiple
                                style={{ display: "none" }}
                                onChange={handleFileSystemChange}
                                disabled={
                                  cameraFileName?.length +
                                    fileSystemFileName?.length >=
                                  5
                                } // Disable if total files >= 5
                              />
                            </label>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <MdOutlineCloudUpload className="fs-1 text-secondary" />
                            <p className="fw-medium text-secondary">
                              Upload files
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? <div class="spinner-border text-muted"></div> : "Submit"}
            </Button>
          </Modal.Footer>
        </Modal>
      <div className="container">
        <p
          className="font-family home-text pt-3 fw-medium fs-3 text-center"
          style={{ color: "#E10174" }}
        >
          Ticketing Portal
        </p>

        <div className="row mt-1">
          <div className="col-12 col-md-8 d-flex flex-column">
            <div className=" col-md-12 flex-grow-1 bg-white shadow-lg border-0 rounded p-2 text-center mb-2">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <img
                  loading="lazy"
                  srcSet="./ticket.webp"
                  alt="Ticket Icon"
                  className="img-fluid rounded-circle"
                  width="200"
                  height="200" // Set a reasonable aspect ratio for image dimensions
                />
              </div>

              <div className="d-flex justify-content-center">
                <button className="btn btn-primary w-auto" onClick={handleShow}>
                  Open A Ticket
                </button>
              </div>
            </div>

            <div className=" col-12 col-md-12 flex-grow-1 bg-white shadow-lg border-0 rounded p-1">
              <div className=" col-md-12 d-flex justify-content-center">
                <p className="fs-3 fw-medium font-family">Status Of Tickets</p>
              </div>
              <div className=" col-12 col-md-12 d-flex row g-3 p-3">
                <Link
                  onClick={handleTotalTickets(ntid)}
                  to="/totalusertickets"
                  className="col-12 col-md-2 text-decoration-none"
                >
                  <div className="  col-12 card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                    <h6 className="fw-medium">Total</h6>
                    <p
                      id="Totalvalue"
                      className="fs-1"
                      style={{ color: "#E10174" }}
                    ></p>
                  </div>
                </Link>
                <Link
                  onClick={handleNew}
                  to="/usertickets"
                  className="col-12 col-md-2 text-decoration-none"
                >
                  <div className="  col-12 card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                    <h6 className="fw-medium">New</h6>
                    <p
                      id="Newvalue"
                      className="fs-1"
                      style={{ color: "#E10174" }}
                    ></p>
                  </div>
                </Link>
                <Link
                  onClick={handleOpened}
                  to="/usertickets"
                  className="col-12 col-md-2 text-decoration-none"
                >
                  <div className=" col-12  card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                    <h6 className="fw-medium">Opened</h6>
                    <p
                      id="Openedvalue"
                      className="fs-1"
                      style={{ color: "#E10174" }}
                    ></p>
                  </div>
                </Link>
                <Link
                  onClick={handleInprogress}
                  to="/usertickets"
                  className="col-12 col-md-2 text-decoration-none"
                >
                  <div className=" col-12  card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                    <h6 className="fw-medium">In Progress</h6>
                    <p
                      id="Inprocessvalue"
                      className="fs-1"
                      style={{ color: "#E10174" }}
                    ></p>
                  </div>
                </Link>
                <Link
                  onClick={handleCompleted}
                  to="/usertickets"
                  className="col-12 col-md-2 text-decoration-none"
                >
                  <div className=" card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                    <h6 className="fw-medium">Completed</h6>
                    <p
                      id="Completedvalue"
                      className="fs-1"
                      style={{ color: "#E10174" }}
                    ></p>
                  </div>
                </Link>
                <Link
                  onClick={handleReOpened}
                  to="/usertickets"
                  className="col-12 col-md-2 text-decoration-none"
                >
                  <div className=" col-12  card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                    <h6 className="fw-medium">Reopened</h6>
                    <p
                      id="reOpenedvalue"
                      className="fs-1"
                      style={{ color: "#E10174" }}
                    ></p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <Card className="shadow-sm rounded" style={{ height: "99%" }}>
              <Pie data={chartData} options={chartOptions} />
            </Card>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
