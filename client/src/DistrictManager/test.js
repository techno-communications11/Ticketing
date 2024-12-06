import React, { useState, useRef } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import { MdOutlineCloudUpload } from "react-icons/md";
import { apiRequest } from "../lib/apiRequest";
import { useEffect } from "react";
import { useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import decodeToken from "../universalComponents/decodeToken";

export function DmsCreateTicket() {
  const [show, setShow] = useState(false);
  const [popButtons, setPopButtons] = useState(false);
  const [cameraFileName, setCameraFileName] = useState([]);
  const [fileSystemFileName, setFileSystemFileName] = useState([]);
  const [selectedStore, setSelectedStore] = useState("Select Store");
  const [selectedNTID, setSelectedNTID] = useState(null);
  const [ntids, setNTids] = useState([]);
  const [Stores, setStores] = useState([]);
  const [AssignTo, setAssignTo] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState("Select Department");
  const [userData, setUserData] = useState("");
  const [searchStore, setSearchStore] = useState("");
  const [filteredStores, setFilteredStores] = useState(userData?.stores || []);
  const [searchNTID, setSearchNTID] = useState("");
  const [filteredNTID, setFilteredNTID] = useState(userData?.stores || []);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [selectedNTIDUser, setSelectedNTIDUser] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest.get("/auth/userdata");
        console.log(response.data, "data");
        setNTids(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users");
      }
    };
    fetchData();
  }, []);

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
    "NTID Mappings",
    "Trainings",
    "Accessories Order",
    "YUBI Key Setups",
    "Charge Back/Commission",
    "Inventory",
    "Admin/Supplies/License/Utilities/Permits/Internet/Telephone/LoomisTechnical/Electricity",
    "Maintenance ",
    "Housing ",
    "CAM NW",
    "HR Payroll",
  ];
  const [searchDepartment, setSearchDepartment] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState(Departments);
  const [errors, setErrors] = useState({
    ntid: "",
    fullname: "",
    phone: "",
    market: "",
    store: "",
    department: "",
    assignedTo: "",
    ticketSubject: "",
    description: "",
    AssignTo: "",
  });
  const phoneRef = useRef(null);
  const ticketSubjectRef = useRef(null);
  const descriptionRef = useRef(null);

  const handleClose = () => {
    setShow(false);
    setCameraFileName(null);
    setFileSystemFileName(null);
    setErrors({
      ntid: "",
      fullname: "",
      phone: "",
      market: "",
      store: "",
      assignedTo: "",
      ticketSubject: "",
      description: "",
      fullname: "",
      AssignTo: "",
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
    const fetchStores = async () => {
      try {
        console.log(selectedMarket, "sel");

        const response = await apiRequest.get(`/createTickets/fetchstores`, {
          params: { selectedMarket },
        });
        const storeNames = response.data.map((store) => store.storeName);
        console.log("Fetched stores:", storeNames);
        setStores(storeNames);
      } catch (error) {
        console.log("Failed to fetch Stores");
      }
    };
    fetchStores();
  }, [selectedMarket]);

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

  const validateForm = () => {
    const newErrors = {
      ntid: "",
      fullname: "",
      phone: "",
      store: "",
      ticketSubject: "",
      description: "",
      departmentId: "",
      market: "",
      department: "",
      assignedTo: "",
    };
    const ntid = selectedNTID;
    const phone = phoneRef.current.value;
    const ticketSubject = ticketSubjectRef.current.value;
    const description = descriptionRef.current.value;
    const market = selectedMarket;
    const Store = selectedStore;
    const departmentId = AssignTo; // departmentId from state
    const fullname = selectedNTIDUser;
    const assignedTo = decodeToken().fullname;
    const AssignTo = selectedNTIDUser;

    if (!ntid) newErrors.ntid = "NTID is required";
    if (!phone) newErrors.phone = "Phone number is required";
    if (!Store === "Select Store")
      newErrors.store = "Store selection is required";
    if (!ticketSubject) newErrors.ticketSubject = "Ticket subject is required";
    if (!description) newErrors.description = "Description is required";
    if (!market) newErrors.market = "Select market";
    if (!assignedTo) newErrors.assignedTo = "No assignedTo Value";
    if (!fullname) newErrors.fullname = "No fullname";
    if (!AssignTo) newErrors.AssignTo = "No AssignTo";
    if (!departmentId) newErrors.departmentId = "Department not assigned"; // Ensure departmentId is selected
    if (selectedDepartment === "select Department")
      newErrors.ticketDepartment = "No ticket department";

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };
  const handleSubmit = () => {
    if (validateForm()) {
      const formData = new FormData();
      formData.append("ntid", selectedNTID);
      formData.append("phone", phoneRef.current.value);
      formData.append("store", selectedStore);
      formData.append("ticketSubject", ticketSubjectRef.current.value);
      formData.append("description", descriptionRef.current.value);
      formData.append("market", selectedMarket);
      formData.append("fullname", selectedNTIDUser);
      formData.append("assignedTo", decodeToken().fullname);
      formData.append("department", selectedDepartment);
      formData.append("departmentId", AssignTo);
      // Append files if any
      if (cameraFileName && cameraFileName.length > 0) {
        cameraFileName.forEach((file) => {
          formData.append("cameraFile", file);
        });
      }

      if (fileSystemFileName && fileSystemFileName.length > 0) {
        fileSystemFileName.forEach((file) => {
          formData.append("fileSystemFile", file);
        });
      }
      // Log the formData content
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
      // Send form data via API request
      apiRequest
        .post("/createTickets/uploadTicket", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          toast.success("Ticket created successfully!");
          handleClose();
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        })
        .catch((error) => {
          if (error.response) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              ntid: error.response.data.message,
            }));
            toast.error(error.response.data.message);
          } else if (error.request) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              ntid: "No response from server. Please try again later.",
            }));
            toast.error("No response from server. Please try again later.");
          } else {
            setErrors((prevErrors) => ({
              ...prevErrors,
              ntid: "Error occurred. Please try again.",
            }));
            toast.error("Error occurred. Please try again.");
          }
        });
    }
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

  useEffect(() => {
    handleNTIDBlur();
  }, [handleShow]);

  useEffect(() => {
    if (searchNTID) {
      const filtered =
        ntids
          .filter(
            (item) => item.ntid.toLowerCase().includes(searchNTID.toLowerCase()) // Access `ntid` property for filtering
          )
          .map((item) => item.ntid) || []; // Map only the `ntid` value
      setFilteredNTID(filtered);
    } else {
      // If no search term, reset filtered list to all `ntid` values
      setFilteredNTID(ntids.map((item) => item.ntid) || []);
    }
  }, [searchNTID, ntids]);

  useEffect(() => {
    if (selectedNTID) {
      const matchedUser = ntids.find(
        (item) => item.ntid.toLowerCase() === selectedNTID.toLowerCase() // Match the `ntid`
      );
      console.log(matchedUser, "Mmu");

      setSelectedNTIDUser(matchedUser?.fullname || ""); // Set `name` if found, else empty string
    } else {
      setSelectedNTIDUser(""); // Reset if no `selectedNTID` is chosen
    }
  }, [selectedNTID, ntids]);

  useEffect(() => {
    if (searchStore) {
      const filtered =
        Stores.filter((store) =>
          store.toLowerCase().includes(searchStore.toLowerCase())
        ) || [];
      setFilteredStores(filtered);
    } else {
      setFilteredStores(Stores || []);
    }
  }, [searchStore, Stores]);

  const handleAssignToSelect = (department) => {
    console.log(department, "department selected");
    setAssignTo(department); // Set department to AssignTo state
    handleSubmit(); // Trigger form submission
    setSearchDepartment(""); // Clear search field (if needed)
  };

  return (
    <div>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Enter Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Dropdown className="flex-grow-1 mb-1 mb-md-0">
              <Dropdown.Toggle
                className="text-start bg-white fw-medium text-secondary border shadow-none w-100 mb-1"
                id="dropdown-basic"
              >
                {selectedNTID || "Select NTID"}{" "}
              </Dropdown.Toggle>

              <Dropdown.Menu className="w-100 fw-medium text-capitalize ">
                <input
                  type="text"
                  value={searchNTID}
                  onChange={(e) => setSearchNTID(e.target.value)}
                  placeholder="Search NTIDS..."
                  className="w-75 form-control border fw-medium text-muted fw-medium shadow-none text-center mb-2 ms-2"
                />

                {filteredNTID.map((ntid, index) => (
                  <Dropdown.Item
                    className="fw-medium text-primary fw-bolder shadow-lg h-50 overflow-auto"
                    key={index} // Use index as the key if no _id is present
                    onClick={() => setSelectedNTID(ntid)} // Set selected NTID on click
                  >
                    {ntid} {/* Display the ntid value */}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <Form.Group
              className="mb-1 d-flex gap-1 flex-wrap"
              controlId="formPhoneNumber"
            >
              <div className="flex-grow-1 mb-1 mb-md-0">
                <Form.Control
                  className="fw-medium text-secondary shadow-none boorder-0 text-capitalize"
                  type="text"
                  value={selectedNTIDUser}
                  placeholder={selectedNTIDUser || "Full Name"}
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
            <Form.Group className="mb-1 d-flex gap-1 " controlId="store">
              <div className="col-md-6">
                <Dropdown className="flex-grow-1 mb-1 mb-md-0 ">
                  <Dropdown.Toggle
                    className="text-start bg-white fw-medium fw-medium text-secondary border shadow-none w-100"
                    id="dropdown-basic"
                  >
                    {selectedMarket || "Select Market"}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-100 fw-medium fw-medium text-capitalize">
                    {markets.map(({ _id, market }) => (
                      <Dropdown.Item
                        className="fw-medium"
                        key={_id}
                        onClick={() => setSelectedMarket(market)}
                      >
                        {market}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="col-md-6">
                <Dropdown className="flex-grow-1" id="dropdown-store">
                  <Dropdown.Toggle
                    className="text-start bg-white fw-medium fw-medium text-secondary border shadow-none w-100"
                    id="dropdown-basic"
                  >
                    {selectedStore || "Select a Store"}{" "}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    style={{ height: "42vh", overflowY: "auto" }}
                    className="col-12"
                  >
                    <input
                      type="text"
                      value={searchStore}
                      onChange={(e) => setSearchStore(e.target.value)}
                      placeholder="Search Stores..."
                      className="w-75 form-control border fw-medium text-muted fw-medium shadow-none text-center mb-2 ms-2"
                    />
                    {/* Store Items */}
                    {filteredStores?.length > 0 ? (
                      filteredStores.sort().map((store, index) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => handleStoreSelect(store)}
                          className="shadow-lg fw-medium text-primary text-start"
                        >
                          {store}
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
              </div>
            </Form.Group>

            <Form.Group controlId="ticketDepartment" className="d-flex gap-2">
              <Dropdown
                className="flex-grow-1 mb-1 col-md-6"
                id="dropdown-department"
              >
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
              <div className="d-flex flex-grow-1 align-items-center col-md-6">
                <Form.Control
                  type="text"
                  placeholder={decodeToken().fullname}
                  isInvalid={!!errors.phone}
                  readOnly
                  className="shadow-none text-secondary fw-medium border"
                />
              </div>
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
                className="shadow-none text-secondary fw-medium boorder-0"
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
          <Dropdown className="flex-grow-1 mb-1" id="dropdown-department">
            <Dropdown.Toggle
              className={`text-center fw-medium fw-medium text-secondary border-0 bg-primary text-white shadow-none w-100`}
              id="dropdown-basic"
            >
              {AssignTo || "Assign To"}
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{ height: "42vh", overflow: "scroll" }}
              className="col-12 col-md-12"
            >
              <input
                onChange={(e) => setSearchDepartment(e.target.value)}
                placeholder="Search Departments..."
                className="w-75 form-control border fw-mediumer text-muted fw-medium shadow-none text-center mb-2 ms-2"
              />
              {filteredDepartments?.length > 0 ? (
                filteredDepartments.map((department, index) => (
                  <Dropdown.Item
                    key={index}
                    onClick={() => handleAssignToSelect(department)}
                    className="shadow-lg fw-medium fw-medium text-primary text-start"
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
                  src="./ticket.png"
                  alt="Ticket Icon"
                  className="img img-fluid rounded-circle"
                  style={{ maxWidth: "150px", height: "auto" }}
                />
              </div>
              <div className="d-flex justify-content-center">
                <button className="btn btn-primary w-auto" onClick={handleShow}>
                  Open A Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
