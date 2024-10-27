import React, { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineCloudUpload } from "react-icons/md";
import { apiRequest } from '../lib/apiRequest';
import { useEffect } from 'react';
import { animateValue } from '../universalComponents/AnnimationCount';
import { setUserAndStatus, fetchStatusTickets } from '../redux/userStatusSlice';
import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export function Home() {
    const [show, setShow] = useState(false);
    const [popButtons, setPopButtons] = useState(false);
    const [cameraFileName, setCameraFileName] = useState(null);
    const [fileSystemFileName, setFileSystemFileName] = useState(null);
    const [selectedStore, setSelectedStore] = useState('Select Store');
    const [selectedDepartment, setSelectedDepartment] = useState('Select Department');
    const [userData, setUserData] = useState('');
    const [TicketsCount, setTicketsCount] = useState(0);

    const Departments = [
         'NTID Mappings', 'Trainings', 'Accessories Order', 'YUBI Key Setups',
        'Charge Back/Commission', 'Inventory', 'Admin/Supplies/License/Utilities/Permits/Internet/Telephone/LoomisTechnical/Electricity',
        'Maintenance ', 'Housing ', 'CAM NW', 'HR Payroll'
    ];

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({
        ntid: '',
        phone: '',
        store: '',
        market: '',
        ticketSubject: '',
        department: '',
        description: '',
    });
    const ntidRef = useRef(null);
    const phoneRef = useRef(null);
    const ticketSubjectRef = useRef(null);
    const descriptionRef = useRef(null);
    const marketRef = useRef(null);
    const fullnameRef = useRef('');


    const handleClose = () => {
        setShow(false);
        setCameraFileName(null);
        setFileSystemFileName(null);
        setErrors({
            ntid: '',
            phone: '',
            store: '',
            ticketSubject: '',
            description: '',
            market: '',
            fullname: '',
        });
        setSelectedStore('Select Store');
        setSelectedDepartment('select Department')
    };

    const handleShow = useCallback(() => {
        setShow(true);
        setPopButtons(false);
    }, [setShow, setPopButtons]);

    useEffect(() => {
    }, [handleShow]);


    const handlefiles = (event) => {
        if (event.target.files.length > 0) {
            setCameraFileName(event.target.files[0]);
            setFileSystemFileName(null);
        }
    }

    const handleCameraChange = (event) => { handlefiles(event); }
    const handleFileSystemChange = (event) => { handlefiles(event); };
    const handleStoreSelect = (store) => { setSelectedStore(store); };
    const handleDepartmentSelect = (department) => {
        setSelectedDepartment(department);
    };

    const validateForm = () => {
        const newErrors = {
            ntid: '',
            fullname: '',
            phone: '',
            store: '',
            ticketSubject: '',
            description: '',
            market: '',
        };
        const ntid = ntidRef.current.value;
        const phone = phoneRef.current.value;
        const ticketSubject = ticketSubjectRef.current.value;
        const description = descriptionRef.current.value;
        const market = marketRef.current.value;
        const fullname = fullnameRef.current.value;
        if (!ntid) newErrors.ntid = 'NTID is required';
        if (!phone) newErrors.phone = 'Phone number is required';
        if (selectedStore === 'Select Store') newErrors.store = 'Store selection is required';
        if (!ticketSubject) newErrors.ticketSubject = 'Ticket subject is required';
        if (!description) newErrors.description = 'Description is required';
        if (!market) newErrors.market = 'select market';
        if (!fullname) newErrors.fullname = 'no fullname';
        if (selectedDepartment === 'select Department') newErrors.ticketDepartment = 'no ticketDepartment'
        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const formData = new FormData();
            formData.append('ntid', ntidRef.current.value);
            formData.append('phone', phoneRef.current.value);
            formData.append('store', selectedStore);
            formData.append('ticketSubject', ticketSubjectRef.current.value);
            formData.append('description', descriptionRef.current.value);
            formData.append('market', marketRef.current.value.toLowerCase());
            formData.append('fullname', fullnameRef.current.value);
            formData.append('department', selectedDepartment)
            if (cameraFileName) {
                formData.append('cameraFile', cameraFileName);
            }
            if (fileSystemFileName) {
                formData.append('fileSystemFile', fileSystemFileName);
            }
            apiRequest.post('/createTickets/uploadTicket', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(response => {
                    toast.success('Ticket created successfully!');
                    handleClose();
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                })
                .catch(error => {
                    if (error.response) {
                        setErrors(prevErrors => ({ ...prevErrors, ntid: error.response.data.message }));
                        toast.error(error.response.data.message);
                    } else if (error.request) {
                        setErrors(prevErrors => ({ ...prevErrors, ntid: 'No response from server. Please try again later.' }));
                        toast.error('No response from server. Please try again later.');
                    } else {
                        setErrors(prevErrors => ({ ...prevErrors, ntid: 'Error occurred. Please try again.' }));
                        toast.error('Error occurred. Please try again.');
                    }
                });
        }
    };

    const handleNTIDBlur = async () => {
        try {
            const response = await apiRequest.get('/profile/getprofiledata_ntid');
            if (response.status === 200) {
                setUserData(response.data);
            } else {
                setErrors(prevErrors => ({ ...prevErrors, ntid: 'User not found or error fetching data' }));
            }
        } catch (error) {
            if (error.response) {
                setErrors(prevErrors => ({ ...prevErrors, ntid: error.response.data.message || 'Invalid NTID entered' }));
            } else if (error.request) {
                setErrors(prevErrors => ({ ...prevErrors, ntid: 'No response from server. Please try again later.' }));
            } else {
                setErrors(prevErrors => ({ ...prevErrors, ntid: 'Error occurred. Please try again.' }));
            }
        }
    };


    const fetchTicketCounts = async () => {
        try {
            const response = await apiRequest.get('/createTickets/countusertickets');
            console.log('Initial ticket count response:', response);
            setTicketsCount(response.data);
        } catch (error) {
            toast.error('Failed to fetch ticket counts');
        }
    };

    useEffect(() => {
        handleNTIDBlur();
        fetchTicketCounts();
    }, [handleShow]);


    useEffect(() => {
        const objTotal = document.getElementById("Totalvalue");
        const objNew = document.getElementById("Newvalue");
        const objOpened = document.getElementById("Openedvalue");
        const objInProgress = document.getElementById("Inprocessvalue");
        const objCompleted = document.getElementById("Completedvalue");
        const objreopened = document.getElementById('reOpenedvalue')
        const totalTickets = (TicketsCount.reopened || 0) + (TicketsCount.new || 0)
            + (TicketsCount.opened || 0) + (TicketsCount.inprogress || 0) + (TicketsCount.completed || 0);
        if (objTotal) { animateValue(objTotal, 0, totalTickets, 500); }
        if (objNew) { animateValue(objNew, 0, TicketsCount.new || 0, 500); }
        if (objOpened) { animateValue(objOpened, 0, TicketsCount.opened || 0, 500); }
        if (objInProgress) { animateValue(objInProgress, 0, TicketsCount.inprogress || 0, 500); }
        if (objCompleted) { animateValue(objCompleted, 0, TicketsCount.completed || 0, 500); }
        if (objreopened) { animateValue(objreopened, 0, TicketsCount.reopened || 0, 500); }
    }, [TicketsCount]);

    const handleDataSend = (statusId) => {
        localStorage.setItem('statusData', statusId);
        dispatch(fetchStatusTickets({ statusId }));
        dispatch(setUserAndStatus({ statusId }));
    };

    const handleNew = () => handleDataSend('1');
    const handleOpened = () => handleDataSend('2');
    const handleInprogress = () => handleDataSend('3');
    const handleCompleted = () => handleDataSend('4');
    const handleReOpened = () => handleDataSend('5');
    const handleTotal = () => { navigate('/totalusertickets') };

    return (
        <div>
            <Modal show={show} onHide={handleClose} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Enter Ticket Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-1 d-flex align-items-center" controlId="formBasicNTID">
                            <Form.Control
                                className='shadow-none text-secondary fw-medium boorder-0'
                                type="text"
                                placeholder="Enter NTID"
                                value={userData?.ntid || ''}
                                isInvalid={!!errors.ntid}
                                ref={ntidRef}
                                readOnly
                            />
                        </Form.Group>
                        <Form.Group className="mb-1 d-flex gap-1 flex-wrap" controlId="formPhoneNumber">
                            <div className='flex-grow-1 mb-1 mb-md-0'>
                                <Form.Control className='fw-medium text-secondary shadow-none boorder-0 text-capitalize' type="text" value={userData?.fullname || ''} placeholder='Full Name' ref={fullnameRef} readOnly />
                            </div>
                            <div className='d-flex flex-grow-1 align-items-center'>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter Phone Number"
                                    isInvalid={!!errors.phone}
                                    ref={phoneRef}
                                    className='shadow-none text-secondary fw-medium border'
                                />
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-1 d-flex gap-1 flex-wrap" controlId="store">
                            <div className='flex-grow-1 mb-1 mb-md-0 '>
                                <Form.Control ref={marketRef} className='text-secondary fw-medium shadow-none boorder-0 text-capitalize' type="text" placeholder='market' value={userData.market?.market || ""} readOnly />
                            </div>
                            <Dropdown className='flex-grow-1' id="dropdown-store">
                                <Dropdown.Toggle className={` text-start bg-white fw-medium text-secondary border shadow-none w-100`} id="dropdown-basic">
                                    {selectedStore}
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={{ height: "42vh", overflow: 'scroll' }} className='col-12 col-md-12'>
                                    <input
                                        placeholder="Search Stores..."
                                        className=" w-75  form-control border text-muted fw-medium  shadow-none text-center  mb-2 ms-2"
                                    />

                                    {userData?.stores?.map((store, index) => (
                                        <Dropdown.Item
                                            key={index}
                                            onClick={() => handleStoreSelect(store)}
                                            className=' shadow-lg fw-medium text-primary text-start'
                                            isInvalid={!!errors.store}
                                        >
                                            {store}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Form.Group>

                        <Form.Group controlId="ticketDepartment">
                            <Dropdown className="mb-1">
                                <Dropdown.Toggle
                                    className={`bg-white fw-medium text-start text-secondary border shadow-none w-100 ${errors.ticketDepartment ? 'is-invalid' : ''}`}
                                    id="ticketDepartmentDropdown"
                                    aria-label="department"
                                >
                                    {selectedDepartment}
                                </Dropdown.Toggle>

                                <Dropdown.Menu style={{ height: "40vh", overflow: 'scroll' }} className='col-12 col-md-12'>
                                <input
                                        placeholder="Search Departments..."
                                        className=" w-75  form-control border shadow-none text-center text-muted fw-medium mb-2 ms-2"
                                        style={{ border: '1px solid gray' }}
                                    />
                                    {Departments.sort().map((department, index) => (
                                        <Dropdown.Item
                                            key={index}
                                            eventKey={department}
                                            className=" shadow-lg fw-medium text-primary text-capitalize"
                                            onClick={() => handleDepartmentSelect(department)}
                                        >
                                            {department}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Form.Group>
                        <Form.Group className="mb-1 d-flex align-items-center " controlId="formTicketSubject">
                            <Form.Control
                                type="text"
                                className='shadow-none fw-medium text-secondary boorder-0'
                                placeholder="Ticket regarding"
                                isInvalid={!!errors.ticketSubject}
                                ref={ticketSubjectRef}
                            />
                        </Form.Group>
                        <Form.Group className="mb-1" controlId="formDescription">
                            <Form.Control
                                className='shadow-none text-secondary  fw-medium boorder-0'
                                as="textarea"
                                placeholder="Enter description"
                                rows={3}
                                isInvalid={!!errors.description}
                                ref={descriptionRef}
                            />
                        </Form.Group>
                        <Form.Group className="mb-1" controlId="fileUpload">
                            <div
                                className='border text-center'
                                onClick={() => setPopButtons(true)}
                                style={{ height: '80px', cursor: 'pointer' }}
                            >
                                {cameraFileName || fileSystemFileName ? (
                                    <div className='mt-4'>
                                        {cameraFileName && <p className='fw-medium text-secondary mt-2'>Selected: {cameraFileName.name}</p>}
                                        {fileSystemFileName && <p className='fw-medium text-secondary mt-2'>Selected: {fileSystemFileName.name}</p>}
                                    </div>
                                ) : (
                                    popButtons ? (
                                        <div className='rounded '>
                                            <label className='btn border-secondary  btn-outline-secondary fw-medium mt-3  me-2'>
                                                Camera
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    capture='environment'
                                                    style={{ display: 'none' }}
                                                    onChange={handleCameraChange}
                                                    disabled={!!fileSystemFileName}
                                                />
                                            </label>
                                            <label className='btn border-secondary btn-outline-secondary fw-medium mt-3'>
                                                Browse
                                                <input
                                                    type='file'
                                                    style={{ display: 'none' }}
                                                    onChange={handleFileSystemChange}
                                                    disabled={!!cameraFileName}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className='mt-1'>
                                            <MdOutlineCloudUpload className='fs-1  text-secondary' />
                                            <p className='fw-medium  text-secondary'>Upload files</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className='container'>
                <p className='font-family home-text pt-5 fw-medium fs-3 text-center' style={{ color: '#E10174' }}>
                    Ticketing Portal
                </p>
                <div className='d-flex flex-column flex-md-row align-items-center justify-content-between mt-4 gap-4 mx-auto'>
                    <div className='card col-12 col-md-4 bg-white shadow-lg rounded py-3 px-4 border-0 text-center'>
                        <div className='d-flex justify-content-center align-items-center mb-3'>
                            <img loading="lazy" src='./ticket.png' alt='Ticket Icon' className='img img-fluid rounded-circle' style={{ maxWidth: '150px', height: 'auto' }} />
                        </div>
                        <div className='d-flex justify-content-center'>
                            <button className='btn btn-primary w-auto' onClick={handleShow}>Open A Ticket</button>
                        </div>
                    </div>
                    <div className='col-12 col-md-8 bg-white shadow-lg border-0 rounded p-2'>
                        <div className='d-flex justify-content-center '>
                            <p className='fs-3 fw-medium font-family' >Status Of Tickets</p>
                        </div>
                        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-6 g-3 p-3">
                            <Link onClick={handleTotal} to="/totalusertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                                    <h6 className="fw-medium">Total</h6>
                                    <p id="Totalvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                            <Link onClick={handleNew} to="/usertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                                    <h6 className="fw-medium">New</h6>
                                    <p id="Newvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                            <Link onClick={handleOpened} to="/usertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                                    <h6 className="fw-medium">Opened</h6>
                                    <p id="Openedvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                            <Link onClick={handleInprogress} to="/usertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                                    <h6 className="fw-medium">InProgress</h6>
                                    <p id="Inprocessvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                            <Link onClick={handleCompleted} to="/usertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                                    <h6 className="fw-medium">Completed</h6>
                                    <p id="Completedvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                            <Link onClick={handleReOpened} to="/usertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-medium text-center p-2">
                                    <h6 className="fw-medium">Reopened</h6>
                                    <p id="reOpenedvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
