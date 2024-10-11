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
    const [userData, setUserData] = useState('');
    const [TicketsCount, setTicketsCount] = useState(0);
    const Departments = [
        'Varun Team',
        'NTID Mappings',
        'Trainings',
        'Accessories Order',
        'YUBI Key Setups',
        'Deposits',
        'Charge Back',
        'Commission',
        'Inventory',
        'Head Office',
        'Admin Related',
        'Maintenance Related',
        'Housing Related',
        'CAM NW',
        'HR Payroll'
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
    const ticketDepartmentRef = useRef('');
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
    };
    const handleShow = useCallback(() => {
        setShow(true);
        setPopButtons(false);
    }, [setShow, setPopButtons]);
    useEffect(() => {
    }, [handleShow]);
    const handleCameraChange = (event) => {
        if (event.target.files.length > 0) {
            setCameraFileName(event.target.files[0]);
            setFileSystemFileName(null);
        }
    };
    const handleFileSystemChange = (event) => {
        if (event.target.files.length > 0) {
            setFileSystemFileName(event.target.files[0]);
            setCameraFileName(null);
        }
    };
    const handleStoreSelect = (store) => {
        setSelectedStore(store);
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
        const ticketDepartment = ticketDepartmentRef.current.value;
        const market = marketRef.current.value;
        const fullname = fullnameRef.current.value;
        if (!ntid) newErrors.ntid = 'NTID is required';
        if (!phone) newErrors.phone = 'Phone number is required';
        if (selectedStore === 'Select Store') newErrors.store = 'Store selection is required';
        if (!ticketSubject) newErrors.ticketSubject = 'Ticket subject is required';
        if (!description) newErrors.description = 'Description is required';
        if (!market) newErrors.market = 'select market';
        if (!fullname) newErrors.fullname = 'no fullname';
        if (!ticketDepartment) newErrors.ticketDepartment = 'no ticketDepartment'
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
            formData.append('department', ticketDepartmentRef.current.value)
            if (cameraFileName) {
                formData.append('cameraFile', cameraFileName);
            }
            if (fileSystemFileName) {
                formData.append('fileSystemFile', fileSystemFileName);
            }
            console.log('fd', formData)
            apiRequest.post('/createTickets/uploadTicket', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(response => {
                    toast.success('Ticket created successfully!', {
                        position: "top-right",
                        autoClose: 2000, // Auto-close the toast after 3 seconds
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                    handleClose();
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000); // Delay in milliseconds (3000ms = 3 seconds)
                })
                .catch(error => {
                    if (error.response) {
                        setErrors(prevErrors => ({ ...prevErrors, ntid: error.response.data.message }));
                        toast.error(error.response.data.message, {
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    } else if (error.request) {
                        setErrors(prevErrors => ({ ...prevErrors, ntid: 'No response from server. Please try again later.' }));
                        toast.error('No response from server. Please try again later.', {
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    } else {
                        setErrors(prevErrors => ({ ...prevErrors, ntid: 'Error occurred. Please try again.' }));
                        toast.error('Error occurred. Please try again.', {
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
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
                const response = await apiRequest.get('/createTickets/countusertickets'); // Replace with your actual API request
                console.log('Initial ticket count response:', response);
                setTicketsCount(response.data); // Assuming response has a count field
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
        const totalTickets = (TicketsCount.reopened || 0) + (TicketsCount.new || 0) + (TicketsCount.opened || 0) + (TicketsCount.inprogress || 0) + (TicketsCount.completed || 0);
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
    }, [TicketsCount]);
    const handleNew = () => {
        const statusId = '1'
        localStorage.setItem('statusData', statusId)
        dispatch(fetchStatusTickets({ statusId }));
        dispatch(setUserAndStatus({ statusId }))
    };
    const handleOpened = () => {
        const statusId = '2'
        localStorage.setItem('statusData', statusId)
        dispatch(fetchStatusTickets({ statusId }));
        dispatch(setUserAndStatus({ statusId }))
    };
    const handleInprogress = () => {
        const statusId = '3'
        localStorage.setItem('statusData', statusId)
        dispatch(fetchStatusTickets({ statusId }));
        dispatch(setUserAndStatus({ statusId }))
    };
    const handleCompleted = () => {
        const statusId = '4'
        localStorage.setItem('statusData', statusId)
        dispatch(fetchStatusTickets({ statusId }));
        dispatch(setUserAndStatus({ statusId }))
    };
    const handleReOpened = () => {
        const statusId = '5'
        localStorage.setItem('statusData', statusId)
        dispatch(fetchStatusTickets({ statusId }));
        dispatch(setUserAndStatus({ statusId }))
    };
    const handleTotal = () => {
        navigate('/totalusertickets')
    };
    return (
        <div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter Ticket Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-2 d-flex align-items-center" controlId="formBasicNTID">
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
                        <Form.Group className="mb-2 d-flex gap-1 flex-wrap" controlId="formPhoneNumber">
                            <div className='flex-grow-1 mb-2 mb-md-0'>
                                <Form.Control className='fw-medium text-secondary shadow-none boorder-0' type="text" value={userData?.fullname || ''} placeholder='Full Name' ref={fullnameRef} readOnly />
                            </div>
                            <div className='d-flex flex-grow-1 align-items-center'>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your Phone Number"
                                    isInvalid={!!errors.phone}
                                    ref={phoneRef}
                                    className='shadow-none fw-medium border'
                                />
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-2 d-flex gap-3 flex-wrap">
                            <div className='flex-grow-1 mb-2 mb-md-0 '>
                                <Form.Control ref={marketRef} className='text-secondary fw-medium shadow-none boorder-0' type="text" placeholder='market'  value={userData.market?.market || ""} readOnly />
                            </div>
                            <Dropdown className='flex-grow-1' id="dropdown-store">
                                <Dropdown.Toggle className={`bg-white fw-medium text-secondary border-dropdown w-100`} id="dropdown-basic">
                                    {selectedStore}
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={{ height: "40vh", overflow:'scroll' }}>
                                    {userData?.stores?.map((store, index) => (
                                        <Dropdown.Item
                                            key={index}
                                            onClick={() => handleStoreSelect(store)}
                                            className='fw-medium text-primary'
                                            isInvalid={!!errors.store}
                                        >
                                            {store}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Form.Group>
                        <Form.Group controlId="ticketSubject">
                            <Form.Select
                                className="shadow-none text-secondary border rounded mb-2 fw-medium"
                                isInvalid={!!errors.department}
                                ref={ticketDepartmentRef}
                                aria-label="department"

                            >
                                <option value="" className="fw-medium text-primary">Select Department</option> {/* Default placeholder option */}
                                {
                                    Departments.sort().map((department, index) => (
                                        <option key={index} className="fw-medium text-primary" value={department}>
                                            {department}
                                        </option>
                                    ))
                                }
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-2 d-flex align-items-center " controlId="formTicketSubject">
                            <Form.Control
                                type="text"
                                className='shadow-none fw-medium boorder-0'
                                placeholder="Ticket regarding"
                                isInvalid={!!errors.ticketSubject}
                                ref={ticketSubjectRef}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2 " controlId="formDescription">
                            <Form.Control
                                className='shadow-none  fw-medium boorder-0'
                                as="textarea"
                                placeholder="Enter description"
                                rows={3}
                                isInvalid={!!errors.description}
                                ref={descriptionRef}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2" controlId="fileUpload">
                            <div
                                className='border text-center'
                                onClick={() => setPopButtons(true)}
                                style={{ height: '80px', cursor: 'pointer' }}
                            >
                                {cameraFileName || fileSystemFileName ? (
                                    <div>
                                        {cameraFileName && <p className='fw-bolder text-secondary mt-2'>Selected: {cameraFileName.name}</p>}
                                        {fileSystemFileName && <p className='fw-bolder text-secondary mt-2'>Selected: {fileSystemFileName.name}</p>}
                                    </div>
                                ) : (
                                    popButtons ? (
                                        <div>
                                            <label className='btn border-secondary  btn-outline-secondary fw-bolder mt-3 me-2'>
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
                                            <label className='btn border-secondary btn-outline-secondary fw-bolder mt-3'>
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
                                        <div>
                                            <MdOutlineCloudUpload className='fs-1  text-secondary' />
                                            <p className='fw-bolder  text-secondary'>Upload files</p>
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
                <p className='font-family home-text pt-5 fw-bolder fs-3 text-center' style={{ color: '#E10174' }}>
                    Ticketing Portal
                </p>
                <div className='d-flex flex-column flex-md-row align-items-center justify-content-between mt-4 gap-4 mx-auto'>
                    <div className='card col-12 col-md-4 bg-white shadow-lg rounded py-3 px-4 border-0 text-center'>
                        <div className='d-flex justify-content-center align-items-center mb-3'>
                            <img src='./ticket.png' alt='Ticket Icon' className='img-fluid rounded-circle' style={{ maxWidth: '150px', height: 'auto' }} />
                        </div>
                        <div className='d-flex justify-content-center'>
                            <button className='btn btn-primary w-auto' onClick={handleShow}>Open A Ticket</button>
                        </div>
                    </div>
                    <div className='col-12 col-md-8 bg-white shadow-lg border-0 rounded p-2'>
                        <div className='d-flex justify-content-center '>
                            <p className='fs-3 fw-bolder text-dark font-family' >Status Of Tickets</p>
                        </div>
                        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-6 g-3 p-3">
                            <Link onClick={handleTotal} to="/totalusertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-bolder text-center p-3">
                                    <h6 className="fw-bold">Total</h6>
                                    <p id="Totalvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                            <Link onClick={handleNew} to="/usertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-bolder text-center p-3">
                                    <h6 className="fw-bold">New</h6>
                                    <p id="Newvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                            <Link onClick={handleOpened} to="/usertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-bolder text-center p-2">
                                    <h6 className="fw-bold">Opened</h6>
                                    <p id="Openedvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                            <Link onClick={handleInprogress} to="/usertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-bolder text-center p-2">
                                    <h6 className="fw-bold">InProgress</h6>
                                    <p id="Inprocessvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                            <Link onClick={handleCompleted} to="/usertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-bolder text-center p-2">
                                    <h6 className="fw-bold">Completed</h6>
                                    <p id="Completedvalue" className="fs-1" style={{ color: '#E10174' }}></p>
                                </div>
                            </Link>
                            <Link onClick={handleReOpened} to="/usertickets" className="col text-decoration-none">
                                <div className="card h-100 rounded bg-body border text-dark fw-bolder text-center p-2">
                                    <h6 className="fw-bold">Reopened</h6>
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
