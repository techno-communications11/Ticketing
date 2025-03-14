import React, { useState, useRef, useEffect, useCallback } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineCloudUpload } from "react-icons/md";
import { apiRequest } from "../lib/apiRequest";
import { animateValue } from "../universalComponents/AnnimationCount";
import { setUserAndStatus, fetchStatusTickets } from "../redux/userStatusSlice";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Card } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import getDecodedToken from "../universalComponents/decodeToken";
import { useMyContext } from "../universalComponents/MyContext";
import "../styles/AdminTicketCreate.css"; // New custom stylesheet

export function AdminTicketCreate() {
  const [show, setShow] = useState(false);
  const [popButtons, setPopButtons] = useState(false);
  const [cameraFileName, setCameraFileName] = useState([]);
  const [fileSystemFileName, setFileSystemFileName] = useState([]);
  const [selectedStore, setSelectedStore] = useState("Select Store");
  const [selectedDepartment, setSelectedDepartment] = useState("Select Department");
  const [userData, setUserData] = useState("");
  const [TicketsCount, setTicketsCount] = useState({});
  const { ntid } = getDecodedToken();
  const { setNtid } = useMyContext();
  const [searchStore, setSearchStore] = useState("");
  const [filteredStores, setFilteredStores] = useState([]);
  const [Stores, setStores] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [AssignTo, setAssignTo] = useState("");
  const [selectedSubDepartment, setSelectedSubDepartment] = useState("");
  const department = getDecodedToken().department;

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
    { _id: "15", market: "india" },
    { _id: "16", market: "head office" },
  ];

  const Departments = [
    "Commission",
    "Inventory",
    "Admin",
    "Software India",
    "Maintenance",
    "HR Payroll",
    "Reporting",
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
  const [loading, setLoading] = useState(false);
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
  const fullnameRef = useRef("");

  const handleClose = () => {
    setShow(false);
    setCameraFileName([]);
    setFileSystemFileName([]);
    setErrors({});
    setSelectedStore("Select Store");
    setSelectedDepartment("Select Department");
    setSelectedSubDepartment("");
    setSelectedMarket("");
    setAssignTo("");
  };

  const handleShow = useCallback(() => {
    setShow(true);
    setPopButtons(false);
  }, []);

  useEffect(() => {
    if (searchDepartment) {
      const filtered = Departments.filter((dept) =>
        dept.toLowerCase().includes(searchDepartment.toLowerCase())
      );
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments(Departments);
    }
  }, [searchDepartment]);

  const handleCameraChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFiles = selectedFiles.length + cameraFileName.length + fileSystemFileName.length;
    if (totalFiles <= 5) {
      setCameraFileName((prev) => [...prev, ...selectedFiles]);
    } else {
      toast.error("You can select up to 5 files in total.");
    }
  };

  const handleFileSystemChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFiles = selectedFiles.length + cameraFileName.length + fileSystemFileName.length;
    if (totalFiles <= 5) {
      setFileSystemFileName((prev) => [...prev, ...selectedFiles]);
    } else {
      toast.error("You can select up to 5 files in total.");
    }
  };

  const filesSelected = cameraFileName.length + fileSystemFileName.length;

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
    setAssignTo(department);
    setSearchDepartment("");
  };

  const validateForm = () => {
    const newErrors = {};
    const fields = [
      { name: "ntid", value: ntidRef.current.value, errorMessage: "NTID is required" },
      { name: "phone", value: phoneRef.current.value, errorMessage: "Phone number is required" },
      { name: "store", value: selectedStore, errorMessage: "Store selection is required", invalidValue: "Select Store" },
      { name: "market", value: selectedMarket, errorMessage: "Market selection is required" },
      { name: "ticketSubject", value: ticketSubjectRef.current.value, errorMessage: "Ticket subject is required" },
      { name: "description", value: descriptionRef.current.value, errorMessage: "Description is required" },
      { name: "department", value: AssignTo, errorMessage: "Assign To department is required" },
    ];
    fields.forEach(({ name, value, errorMessage, invalidValue }) => {
      if (!value || (invalidValue && value === invalidValue)) {
        newErrors[name] = errorMessage;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    const fields = [
      { name: "ntid", value: ntidRef.current.value },
      { name: "phone", value: phoneRef.current.value.replace(/[^0-9]/g, "").slice(-10) },
      { name: "store", value: selectedStore },
      { name: "ticketSubject", value: ticketSubjectRef.current.value },
      { name: "description", value: descriptionRef.current.value },
      { name: "market", value: selectedMarket },
      { name: "fullname", value: fullnameRef.current.value },
      { name: "department", value: selectedDepartment },
      { name: "subdepartment", value: selectedSubDepartment },
      { name: "departmentId", value: AssignTo },
    ];
    fields.forEach(({ name, value }) => formData.append(name, value));
    cameraFileName.forEach((file) => formData.append("cameraFile", file));
    fileSystemFileName.forEach((file) => formData.append("fileSystemFile", file));

    setLoading(true);
    try {
      await apiRequest.post("/createTickets/uploadTicket", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      handleClose();
      toast.success("Ticket created successfully!");
      fetchTicketCounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNTIDBlur = async () => {
    try {
      const response = await apiRequest.get("/profile/getprofiledata_ntid");
      if (response.status === 200) {
        setUserData(response.data);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        ntid: error.response?.data?.message || "Invalid NTID entered",
      }));
    }
  };

  const fetchTicketCounts = async () => {
    try {
      const response = await apiRequest.get("/createTickets/countusertickets", { params: { ntid } });
      console.log("Raw server response:", response.data); // Log raw data
      const rawData = response.data;
      const normalizedData = {
        new: rawData.new || 0,
        opened: rawData.opened || 0,
        inProgress: rawData.inprogress || 0,
        completed: rawData.completed || 0,
        reopened: rawData.reopened || 0,
      };
      setTicketsCount(normalizedData);
      console.log("Normalized ticket counts:", normalizedData);
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
        const response = await apiRequest.get(`/createTickets/fetchstores`, { params: { selectedMarket } });
        const storeNames = response.data.map((store) => store.storeName);
        setStores(storeNames);
      } catch (error) {
        console.log("Failed to fetch Stores");
      }
    };
    if (selectedMarket) fetchStores();
  }, [selectedMarket]);

  useEffect(() => {
    const animateCounts = () => {
      const totalTickets =
        (TicketsCount.reopened || 0) +
        (TicketsCount.new || 0) +
        (TicketsCount.opened || 0) +
        (TicketsCount.inProgress || 0) +
        (TicketsCount.completed || 0);
      ["Total", "New", "Opened", "In Progress", "Completed", "Reopened"].forEach((key, idx) => {
        const element = document.getElementById(`${key}value`);
        if (element) {
          const normalizedKey = key === "In Progress" ? "inProgress" : key.toLowerCase();
          animateValue(element, 0, idx === 0 ? totalTickets : TicketsCount[normalizedKey] || 0, 500);
        }
      });
      if (totalTickets > 0) TicketsCount.Ticket = totalTickets;
    };
    animateCounts();
  }, [TicketsCount]);

  const handleDataSend = (statusId, ntid) => {
    localStorage.setItem("statusData", statusId);
    dispatch(fetchStatusTickets({ statusId, ntid }));
    dispatch(setUserAndStatus({ statusId, ntid }));
  };

  const handleTotalTickets = (AdminsDatantid) => () => {
    setNtid(AdminsDatantid);
    localStorage.setItem("adminntid", AdminsDatantid);
    localStorage.removeItem("statusId");
    localStorage.removeItem("dates");
    if (AdminsDatantid) navigate("/totalusertickets");
  };

  const filteredInsights = Object.entries(TicketsCount)
    .filter(([key]) => key !== "Ticket")
    .map(([key, value]) => [
      key === "inProgress" ? "In Progress" : key === "reopened" ? "Reopened" : key.charAt(0).toUpperCase() + key.slice(1),
      value,
    ]);

    const chartData = {
      labels: filteredInsights.map(([key]) => key),
      datasets: [
        {
          data: filteredInsights.map(([, value]) => value),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
          hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        },
      ],
    };
  
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { position: "top", labels: { font: { family: "Roboto" }, color: "#42526e" } },
        title: { display: true, text: "Ticket Counts by Status", font: { size: 18, family: "Roboto" }, color: "#E10174" },
        tooltip: { backgroundColor: "#E10174", titleFont: { family: "Roboto" }, bodyFont: { family: "Roboto" } },
      },
    };

  useEffect(() => {
    setFilteredStores(
      searchStore
        ? Stores.filter((store) => store.toLowerCase().includes(searchStore.toLowerCase()))
        : Stores
    );
  }, [searchStore, Stores]);

  useEffect(() => {
    setFilteredSubDepartments(
      searchSubDepartment
        ? admin.filter((sub) => sub.toLowerCase().includes(searchSubDepartment.toLowerCase()))
        : admin
    );
  }, [searchSubDepartment]);

  return (
    <div className="ticket-create-container">
      <Modal show={show} onHide={handleClose} size="lg" className="ticket-modal">
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">Enter Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicNTID">
              <Form.Control
                type="text"
                placeholder="Enter NTID"
                value={userData?.ntid || ""}
                isInvalid={!!errors.ntid}
                ref={ntidRef}
                readOnly
                className="form-input"
              />
              <Form.Control.Feedback type="invalid">{errors.ntid}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3 d-flex gap-2 flex-wrap" controlId="formPhoneNumber">
              <div className="flex-grow-1">
                <Form.Control
                  type="text"
                  value={userData?.fullname || ""}
                  placeholder="Full Name"
                  ref={fullnameRef}
                  readOnly
                  className="form-input"
                />
              </div>
              <div className="flex-grow-1">
                <Form.Control
                  type="text"
                  placeholder="Enter Phone Number"
                  isInvalid={!!errors.phone}
                  ref={phoneRef}
                  className="form-input"
                />
                <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
              </div>
            </Form.Group>
            <Form.Group className="mb-3 d-flex gap-2 flex-wrap" controlId="store">
              <Dropdown className="flex-grow-1">
                <Dropdown.Toggle className="dropdown-toggle w-100">{selectedMarket || "Select Market"}</Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-scroll">
                  {markets
                    .filter(({ market }) => (department === "Internal" ? market === "india" : true))
                    .map(({ _id, market }) => (
                      <Dropdown.Item key={_id} onClick={() => setSelectedMarket(market)} className="dropdown-item-pink">
                        {market}
                      </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown className="flex-grow-1">
                <Dropdown.Toggle className="dropdown-toggle w-100">{selectedStore}</Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-scroll">
                  <input
                    type="text"
                    value={searchStore}
                    onChange={(e) => setSearchStore(e.target.value)}
                    placeholder="Search Stores..."
                    className="dropdown-search mx-2 mb-2"
                  />
                  {filteredStores.length > 0 ? (
                    filteredStores.sort().map((store, index) => (
                      <Dropdown.Item key={index} onClick={() => handleStoreSelect(store)} className="dropdown-item-pink">
                        {store.toLowerCase()}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled className="text-muted">No stores found</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
            <Form.Group className="mb-3" controlId="ticketDepartment">
              <Dropdown className="flex-grow-1">
                <Dropdown.Toggle className="dropdown-toggle w-100">{selectedDepartment}</Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-scroll">
                  <input
                    value={searchDepartment}
                    onChange={(e) => setSearchDepartment(e.target.value)}
                    placeholder="Search Departments..."
                    className="dropdown-search mx-2 mb-2"
                  />
                  {department === "Internal" ? (
                    <Dropdown.Item onClick={() => handleDepartmentSelect("Software India")} className="dropdown-item-pink">
                      Software India
                    </Dropdown.Item>
                  ) : filteredDepartments.length > 0 ? (
                    filteredDepartments.map((dept, index) => (
                      <Dropdown.Item key={index} onClick={() => handleDepartmentSelect(dept)} className="dropdown-item-pink">
                        {dept}
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled className="text-muted">No departments found</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              {selectedDepartment === "Admin" && (
                <Dropdown className="flex-grow-1 mt-2">
                  <Dropdown.Toggle className="dropdown-toggle w-100">{selectedSubDepartment || "Select Sub Department"}</Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-scroll">
                    <input
                      value={searchSubDepartment}
                      onChange={(e) => setSearchSubDepartment(e.target.value)}
                      placeholder="Search Sub Departments..."
                      className="dropdown-search mx-2 mb-2"
                    />
                    {filteredSubDepartments.length > 0 ? (
                      filteredSubDepartments.map((sub, index) => (
                        <Dropdown.Item key={index} onClick={() => handleSubDepartmentSelect(sub)} className="dropdown-item-pink">
                          {sub}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item disabled className="text-muted">No sub-departments found</Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTicketSubject">
              <Form.Control
                type="text"
                placeholder="Ticket regarding"
                isInvalid={!!errors.ticketSubject}
                ref={ticketSubjectRef}
                className="form-input"
              />
              <Form.Control.Feedback type="invalid">{errors.ticketSubject}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Control
                as="textarea"
                placeholder="Enter description"
                rows={3}
                isInvalid={!!errors.description}
                ref={descriptionRef}
                className="form-input"
              />
              <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="fileUpload">
              <div className="file-upload-area" onClick={() => !popButtons && setPopButtons(true)}>
                {filesSelected > 0 ? (
                  <div className="file-upload-text">
                    {cameraFileName.length > 0 && <p>{cameraFileName.length} camera file(s) selected</p>}
                    {fileSystemFileName.length > 0 && <p>{fileSystemFileName.length} file(s) selected</p>}
                  </div>
                ) : popButtons ? (
                  <div className="file-upload-buttons">
                    <label className="btn btn-outline-pink me-2">
                      Camera
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        onChange={handleCameraChange}
                        disabled={filesSelected >= 5}
                        hidden
                      />
                    </label>
                    <label className="btn btn-outline-pink">
                      Browse
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSystemChange}
                        disabled={filesSelected >= 5}
                        hidden
                      />
                    </label>
                  </div>
                ) : (
                  <div className="file-upload-placeholder">
                    <MdOutlineCloudUpload className="upload-icon" />
                    <p>Upload files</p>
                  </div>
                )}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Dropdown className="flex-grow-1">
            <Dropdown.Toggle className="dropdown-toggle assign-to-btn">{AssignTo || "Assign To"}</Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-scroll">
              <input
                value={searchDepartment}
                onChange={(e) => setSearchDepartment(e.target.value)}
                placeholder="Search Departments..."
                className="dropdown-search mx-2 mb-2"
              />
              {department === "Internal" ? (
                <Dropdown.Item onClick={() => handleAssignToSelect("Software India")} className="dropdown-item-pink">
                  Software India
                </Dropdown.Item>
              ) : filteredDepartments
                  .filter((dept) =>
                    selectedMarket === "head office"
                      ? dept === "Admin"
                      : selectedMarket === "india"
                      ? dept === "Software India"
                      : true
                  )
                  .map((dept, index) => (
                    <Dropdown.Item key={index} onClick={() => handleAssignToSelect(dept)} className="dropdown-item-pink">
                      {dept}
                    </Dropdown.Item>
                  ))}
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="pink" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="container-fluid ticket-portal">
        <h4 className="portal-title">Ticketing Portal</h4>
        <div className="row mt-3">
          <div className="col-12 col-md-8 d-flex flex-column gap-3">
            <Card className="ticket-action-card shadow-sm p-3">
              <img src="./ticket.webp" alt="Ticket Icon" className="ticket-icon mx-auto d-block" />
              <Button variant="pink" onClick={handleShow} className="d-block mx-auto mt-3">
                Open A Ticket
              </Button>
            </Card>
            <Card className="status-card shadow-sm p-3">
              <h5 className="status-title text-center">Status Of Tickets</h5>
              <div className="row g-3">
                {[
                  { label: "Total", id: "Totalvalue", handler: handleTotalTickets(ntid), to: "/totalusertickets" },
                  { label: "New", id: "Newvalue", handler: () => handleDataSend("1", ntid), to: "/usertickets" },
                  { label: "Opened", id: "Openedvalue", handler: () => handleDataSend("2", ntid), to: "/usertickets" },
                  { label: "In Progress", id: "In Progressvalue", handler: () => handleDataSend("3", ntid), to: "/usertickets" },
                  { label: "Completed", id: "Completedvalue", handler: () => handleDataSend("4", ntid), to: "/usertickets" },
                  { label: "Reopened", id: "Reopenedvalue", handler: () => handleDataSend("5", ntid), to: "/usertickets" },
                ].map(({ label, id, handler, to }) => (
                  <div className="col-12 col-md-2" key={label}>
                    <Link to={to} onClick={handler} className="text-decoration-none">
                      <Card className="status-item text-center p-2 h-100">
                        <h6>{label}</h6>
                        <p id={id} className="status-count" />
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="col-12 col-md-4">
            <Card className="chart-card shadow-sm p-3">
              <Pie data={chartData} options={chartOptions} />
            </Card>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}

export default AdminTicketCreate;