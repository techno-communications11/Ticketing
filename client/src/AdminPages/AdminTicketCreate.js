import React, { useState, useRef } from "react";
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
import { Button, Card } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import getDecodedToken from "../universalComponents/decodeToken";
import { useMyContext } from "../universalComponents/MyContext";

export function AdminTicketCreate() {
  const [show, setShow] = useState(false);
  const [popButtons, setPopButtons] = useState(false);
  const [cameraFileName, setCameraFileName] = useState([]);
  const [fileSystemFileName, setFileSystemFileName] = useState([]);
  const [selectedStore, setSelectedStore] = useState("Select Store");
  const [selectedDepartment, setSelectedDepartment] =
    useState("Select Department");
  const [userData, setUserData] = useState("");
  const [TicketsCount, setTicketsCount] = useState(0);
  const { ntid } = getDecodedToken();
  const { setNtid } = useMyContext();
  const [searchStore, setSearchStore] = useState("");
  const [filteredStores, setFilteredStores] = useState(userData?.stores || []);
  const [Stores, setStores] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [AssignTo, setAssignTo] = useState(""); // Default to empty string if no department is selected
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");

  const markets = [
    { _id: "1", market: "arizona" },
    { _id: "2", market: "colorado" },
    { _id: "3", market: "dallas" },
    { _id: "4", market: "el paso" },
    { _id: "5", market: "florida" },
    { _id: "6", market: "houston" },
    { _id: "7", market: "los angeles" },
    { _id: "8", market: "memphis" },
    { _id: "9", market: "nashville" },
    { _id: "10", market: "north carol" },
    { _id: "11", market: "sacramento" },
    { _id: "12", market: "san diego" },
    { _id: "13", market: "san francisco" },
    { _id: "14", market: "bay area" },
  ];

  const Departments = [
    // "NTID Mappings",
    // "Trainings",
    // "Accessories Order",
    // "YUBI Key Setups",
    // "Charge Back/Commission",
    // "Inventory",
    "Admin",
    "Software India"
    // "Maintenance ",
    // "Housing ",
    // "CAM NW",
    // "HR Payroll",
  ];
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

  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchSubDepartment, setSearchSubDepartment] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState(Departments);
  const [filteredSubDepartments, setFilteredSubDepartments] = useState(admin);
  const [loading, setLoading] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    ntid: "",
    phone: "",
    store: "",
    market: "",
    ticketSubject: "",
    department: "",
    // subdepartment:"",
    description: "",
  });
  const ntidRef = useRef(null);
  const phoneRef = useRef(null);
  const ticketSubjectRef = useRef(null);
  const descriptionRef = useRef(null);
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
    setSelectedSubDepartment("select sub department");
  };

  const handleShow = useCallback(() => {
    setShow(true);
    setPopButtons(false);
  }, [setShow, setPopButtons]);

  useEffect(() => {}, [handleShow]);

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
  const handleSubDepartmentSelect = (department) => {
    setSelectedSubDepartment(department);
    setSearchSubDepartment("");
  };
  const handleAssignToSelect = (department) => {
    console.log(department, "department selected");
    setAssignTo(department); // Set department to AssignTo state
    setSearchDepartment(""); // Clear search field (if needed)
    setSearchSubDepartment("");
  };

  const validateForm = () => {
    const newErrors = {};
  
    // Collect all the fields to validate
    const fields = [
      { name: 'ntid', value: ntidRef.current.value, errorMessage: "NTID is required" },
      { name: 'phone', value: phoneRef.current.value, errorMessage: "Phone number is required" },
      { name: 'store', value: selectedStore, errorMessage: "Store selection is required", invalidValue: "Select Store" },
      { name: 'ticketSubject', value: ticketSubjectRef.current.value, errorMessage: "Ticket subject is required" },
      { name: 'description', value: descriptionRef.current.value, errorMessage: "Description is required" },
      { name: 'market', value: selectedMarket, errorMessage: "Select market" },
      { name: 'fullname', value: fullnameRef.current.value, errorMessage: "No fullname" },
      { name: 'departmentId', value: AssignTo, errorMessage: "Department not assigned" },
      { name: 'ticketDepartment', value: selectedDepartment, errorMessage: "No ticket department", invalidValue: "select Department" },
    ];
  
    // Loop through each field and check its validity
    fields.forEach(({ name, value, errorMessage, invalidValue }) => {
      if (!value || (invalidValue && value === invalidValue)) {
        newErrors[name] = errorMessage;
      }
    });
  
    // Set the error state only once
    setErrors(newErrors);
  
    // Return true if no errors are present, false otherwise
    return Object.keys(newErrors).length === 0;
  };
  

  const handleSubmit = () => {
    if (!validateForm()) return;
  
    const formData = new FormData();
  
    // Define all the fields to be appended
    const fields = [
      { name: 'ntid', value: ntidRef.current.value },
      { name: 'phone', value: phoneRef.current.value.replace(/[^0-9]/g, "").slice(-10) },
      { name: 'store', value: selectedStore },
      { name: 'ticketSubject', value: ticketSubjectRef.current.value },
      { name: 'description', value: descriptionRef.current.value },
      { name: 'market', value: selectedMarket },
      { name: 'fullname', value: fullnameRef.current.value },
      { name: 'department', value: selectedDepartment },
      { name: 'subdepartment', value: selectedSubDepartment },
      { name: 'departmentId', value: AssignTo },
    ];
  
    // Loop through the fields array to append values to formData
    fields.forEach(({ name, value }) => {
      console.log(value, `${name} value`);
      formData.append(name, value);
    });
  
    // Append files if available
    const appendFiles = (fileArray, fieldName) => {
      if (fileArray?.length > 0) {
        fileArray.forEach((file) => {
          console.log(file, `${fieldName} value`);
          formData.append(fieldName, file);
        });
      }
    };
  
    appendFiles(cameraFileName, 'cameraFile');
    appendFiles(fileSystemFileName, 'fileSystemFile');
  
    // Log all formData entries
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
  
    setLoading(true);
  
    // API request
    apiRequest
      .post("/createTickets/uploadTicket", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        
        handleClose();
        setLoading(false);
  
        // Optional: Refresh UI state
        setTimeout(() => {
          toast.success("Ticket created successfully!");
          fetchTicketCounts();
        }, 1000);
      })
      .catch((error) => {
        let errorMessage = "Error occurred. Please try again.";
        
        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
          errorMessage = "No response from server. Please try again later.";
        }
  
        setErrors((prevErrors) => ({
          ...prevErrors,
          ntid: errorMessage,
        }));
        toast.error(errorMessage);
      });
  };
  

  const handleNTIDBlur = async () => {
    try {
      const response = await apiRequest.get("/profile/getprofiledata_ntid");
  
      if (response.status === 200) {
        setUserData(response.data);
      } else {
        throw new Error("User not found or error fetching data");
      }
    } catch (error) {
      let errorMessage = "Error occurred. Please try again.";
  
      // Determine the error message based on the error type
      if (error.response) {
        errorMessage = error.response.data.message || "Invalid NTID entered";
      } else if (error.request) {
        errorMessage = "No response from server. Please try again later.";
      }
  
      // Set the error in the state only once
      setErrors((prevErrors) => ({
        ...prevErrors,
        ntid: errorMessage,
      }));
    }
  };
  

  const fetchTicketCounts = async () => {
    try {
      const response = await apiRequest.get("/createTickets/countusertickets",{
        params: { ntid },
      });
      setTicketsCount(response.data);
    } catch (error) {
      toast.error("Failed to fetch ticket counts");
    }
  };

  useEffect(() => {
    handleNTIDBlur();
    fetchTicketCounts();
  }, [handleShow]);

  useEffect(() => {
    const fetchStores = async () => {
      try {

        const response = await apiRequest.get(`/createTickets/fetchstores`, {
          params: { selectedMarket },
        });
        const storeNames = response.data.map((store) => store.storeName);
        setStores(storeNames);
      } catch (error) {
        console.log("Failed to fetch  Stores");
      }
    };
    fetchStores();
  }, [selectedMarket]);

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

  const handleTotalTickets = (AdminsDatantid) => () => {
    setNtid(AdminsDatantid);

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
      const filtered = Stores.filter((store) =>
        store.toLowerCase().includes(searchStore.toLowerCase())
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(Stores || []);
    }
  }, [searchStore, Stores]);

  useEffect(() => {
    if (searchSubDepartment) {
      const filtered = admin.filter((admin) =>
        admin.toLowerCase().includes(searchSubDepartment.toLowerCase())
      );
      setFilteredSubDepartments(filtered);
    } else {
      setFilteredSubDepartments(admin || []);
    }
  }, [searchSubDepartment]);

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
  };

  return (
    <div>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-medium">Enter Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group
              className="mb-1 d-flex align-items-center"
              controlId="formBasicNTID"
            >
              <Form.Control
                className="shadow-none  text-secondary fw-medium border"
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
                  className="fw-medium  text-secondary shadow-none border text-capitalize"
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
              <div className="flex-grow-1  mb-1 mb-md-0">
                <Dropdown>
                  <Dropdown.Toggle
                    className="text-secondary bg-white text-start fw-medium shadow-none border text-capitalize w-100"
                    id="market-dropdown"
                  >
                    {selectedMarket || "Select Market"}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-100 text-capitalize ">
                    {markets.map(({ _id, market }) => (
                      <Dropdown.Item
                        className="fw-medium  shadow-lg text-primary"
                        key={_id}
                        onClick={() => setSelectedMarket(market)}
                      >
                        {market}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <Dropdown className="flex-grow-1" id="dropdown-store">
                <Dropdown.Toggle
                  className="text-start bg-white fw-medium  text-secondary border shadow-none w-100"
                  id="dropdown-basic"
                >
                  {selectedStore || "Select a Store"}{" "}
                  {/* Placeholder if no store is selected */}
                </Dropdown.Toggle>

                <Dropdown.Menu
                  style={{ height: "42vh", overflowY: "auto" }}
                  className="col-12 col-md-12"
                >
                  {/* Search Input */}
                  <input
                    type="text"
                    value={searchStore}
                    onChange={(e) => setSearchStore(e.target.value)}
                    placeholder="Search Stores..."
                    className="w-75 form-control border  fw-medium text-muted  shadow-none text-center mb-2 ms-2"
                  />

                  {/* Store Items */}
                  {filteredStores?.length > 0 ? (
                    filteredStores.sort().map((store, index) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => handleStoreSelect(store)}
                        className="shadow-lg  fw-medium text-primary text-start text-capitalize"
                      >
                        {store.toLowerCase()}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item
                      disabled
                      className="text-muted text-start fw-medium"
                    >
                      No stores found
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>

            <Form.Group controlId="ticketDepartment">
              <Dropdown className="flex-grow-1 mb-1" id="dropdown-department">
                <Dropdown.Toggle
                  className={`text-start fw-medium bg-white  text-muted border shadow-none w-100`}
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
                    className="w-75 form-control border fw-medium text-muted  shadow-none text-center mb-2 ms-2"
                  />
                  {filteredDepartments?.length > 0 ? (
                    filteredDepartments.map((department, index) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => handleDepartmentSelect(department)}
                        className="shadow-lg fw-medium text-primary text-start"
                        // isinvalid={!!errors.department}
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
                      className={`text-start fw-medium bg-white  text-secondary border shadow-none w-100`}
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
                        className="w-75 form-control border  text-muted fw-medium shadow-none text-center mb-2 ms-2"
                      />
                      {filteredSubDepartments?.length > 0 ? (
                        filteredSubDepartments.map((department, index) => (
                          <Dropdown.Item
                            key={index}
                            onClick={() =>
                              handleSubDepartmentSelect(department)
                            }
                            className="shadow-lg fw-medium  text-primary text-start"
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
                className="shadow-none fw-medium  text-secondary border"
                placeholder="Ticket regarding"
                isInvalid={!!errors.ticketSubject}
                ref={ticketSubjectRef}
              />
            </Form.Group>
            <Form.Group className="mb-1" controlId="formDescription">
              <Form.Control
                className="shadow-none fw-medium text-secondary  border"
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
                        <div className="mt-4 fw-medium">
                          {cameraFileName?.length > 0 && (
                            <p className="fw-medium text-secondary mt-2">
                              {cameraFileName?.length} camera file(s) selected
                            </p>
                          )}
                          {fileSystemFileName?.length > 0 && (
                            <p className="fw-medium  text-secondary mt-2">
                              {fileSystemFileName?.length} file(s) selected
                            </p>
                          )}
                        </div>
                      ) : popButtons ? (
                        <div className="rounded ">
                          <label className="btn border-secondary fw-medium btn-outline-secondary mt-3 me-2">
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
                          <p className="fw-medium text-secondary fw-medium">
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
          <div className="mt-2">
            <Dropdown className="flex-grow-1 mb-1" id="dropdown-department">
              <Dropdown.Toggle
                className={`text-center fw-medium   text-secondary border-0 bg-primary text-white shadow-none w-100`}
                id="dropdown-basic"
              >
                {AssignTo || "Assign To"}
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{ height: "42vh", overflow: "scroll", width: "20rem" }}
                className="col-12 col-md-12"
              >
                <input
                  onChange={(e) => setSearchDepartment(e.target.value)}
                  placeholder="Search Departments..."
                  className="w-75 form-control border  text-muted fw-medium shadow-none text-center mb-2 ms-2"
                />
                {filteredDepartments?.length > 0 ? (
                  filteredDepartments.map((department, index) => (
                    <Dropdown.Item
                      key={index}
                      onClick={() => handleAssignToSelect(department)}
                      className="shadow-lg fw-medium  text-primary text-start"
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
          </div>
          <Button onClick={handleSubmit}>
            {loading ? (
              <div class="spinner-border text-dark " disabled={loading}></div>
            ) : (
              "Submit"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="container">
        <h4
          className="font-family  pt-3  text-center"
          style={{ color: "#E10174" }}
        >
          Ticketing Portal
        </h4>

        <div className="row mt-1">
          <div className="col-12 col-md-8 d-flex flex-column">
            <div className=" col-md-12 flex-grow-1 shadow-lg rounded p-2 mb-2">
              <div className="d-flex justify-content-center align-items-center">
                <img
                  loading="lazy"
                  src="./ticket.webp"
                  alt="Ticket Icon"
                  className="img img-fluid rounded-circle"
                  width= "200"
                   height="200"
                />
              </div>
              <div className="d-flex justify-content-center">
                <button
                  className="btn btn-primary"
                  onClick={handleShow}
                >
                  Open A Ticket
                </button>
              </div>
            </div>

            <div className=" col-12 col-md-12 flex-grow-1 bg-white shadow-lg  rounded p-1">
              <div className=" col-md-12 d-flex justify-content-center">
                <h5 className="font-family">Status Of Tickets</h5>
              </div>
              <div className=" col-12 col-md-12 d-flex row g-3 p-3">
                <Link
                  onClick={handleTotalTickets(ntid)}
                  to="/totalusertickets"
                  className="col-12 col-md-2 text-decoration-none"
                >
                  <div className="  col-12 card h-100 rounded text-center p-2">
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
                  <div className="  col-12 card h-100 rounded text-center p-2">
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
                  <div className=" col-12  card h-100 rounded  text-center p-2">
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
                  <div className=" col-12  card h-100 rounded text-center p-2">
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
                  <div className=" card h-100 rounded  text-center p-2">
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
                  <div className=" col-12  card h-100 rounded  text-center p-2">
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
