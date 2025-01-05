import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Table from 'react-bootstrap/Table';
import { apiRequest } from '../lib/apiRequest';
import { MdModeEditOutline } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { FaEye, FaRegEye, FaEyeSlash } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';
import '../styles/loader.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageCountStack from '../universalComponents/PageCountStack';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30 ;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest.get('/auth/userdata');
      // console.log(response.data,"hahahj")
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error("Error fetching users");
      }
    };
    fetchData();
  }, []);


  const handleSearch = (query) => {
    const input = query.trim().toLowerCase();
    if (!input) {
      toast.error("Please enter a search term");
      return;
    }
    const filteredUsers = users.filter(user => {
      const ntid = user.ntid ? user.ntid.toLowerCase() : '';
      const fullname = user.fullname ? user.fullname.toLowerCase() : '';
      const market = user.market && user.market.market ? user.market.market.toLowerCase() : '';
      const dmName = user.dmName ? user.dmName.toLowerCase() : '';
  
      return (
        ntid?.includes(input) ||
        fullname?.includes(input) ||
        market?.includes(input) ||
        dmName?.includes(input)
      );
    });
    setUsers(filteredUsers);
    setCurrentPage(1)
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setShowImageModal(false);
  };

  const handlePasswordToggle = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiRequest.put("/auth/user", selectedUser);
      toast.success("Password updated successfully");
      const response = await apiRequest.get('/auth/userdata');
      setUsers(response.data);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Error updating user");
    } finally {
      setShowModal(false);
    }
  };

  const viewImage = (user) => {
    setSelectedUser(user);
    setShowImageModal(true);
  };

  const currentItems = useMemo(() => {
    return users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [currentPage, users]);

  return (
    <div className="container">
      <div className='d-flex justify-content-center mt-1'>
        <div className='col-md-6 d-flex gap-2 rounded align-items-center col-10 my-2' style={{ border: '1.5px solid gray' }}>
          <input
            type="text"
            className='form-control input-form fw-medium border-0 shadow-none'
            placeholder="Search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={() => handleSearch(query)} className='btn btn-white fs-5 border-0 shadow-lg text-success fw-medium'>
            <CiSearch />
          </button>
        </div>
      </div>
      {isSearching ? (
        <div className='vh-100'>
          <div className='loader d-flex align-items-center justify-content-center vh-80'></div>
        </div>
      ) : (
        <div>
          {users.length === 0 ? (
            <div className="container">
              <div className='loader mb-5'></div>
            </div>
          ) : (
            <div>
              <div className="d-flex justify-content-between align-items-center ">
                <h4 className="font-family mb-0" style={{ color: '#E10174' }}>Users Information</h4>
                <h4 className="mb-0" style={{ color: '#E10174' }}>users: {users.length}</h4>
              </div>
              <Table striped bordered hover responsive className='table  align-middle text-center table-sm'>
                <thead>
                  <tr>
                  {['SC.No', 'Email / NTID', 'Full Name', 'Market', 'DmName', 'Edit', 'View Profile'].map((header) => (
                  <th key={header} className='text-center' style={{ backgroundColor: '#E10174', color: 'white' }}>{header}</th>
                ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((user, index) => (
                    <tr key={user.ntid} className='fw-medium'>
                      <td className='text-center'>{(currentPage - 1) * itemsPerPage+index + 1}</td>
                      <td className='text-center'>{user.ntid}</td>
                      <td className='text-center text-capitalize'>{user.fullname?.toLowerCase()}</td>
                      <td className='text-center text-capitalize'>{user.market ? user.market.market : ""}</td>
                      <td className='text-center text-capitalize'>{user.dmName}</td>
                      <td style={{ cursor: 'pointer' }} className='text-center' onClick={() => handleEdit(user)}>
                        <MdModeEditOutline />
                      </td>
                      <td style={{ cursor: 'pointer' }} className='text-center' onClick={() => viewImage(user)}>
                        <FaEye />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      )}

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formNtid">
              <Form.Label>Email / NTID</Form.Label>
              <Form.Control
                type="text"
                name="ntid"
                value={selectedUser?.ntid || ''}
                onChange={handleInputChange}
                required
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formFullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullname"
                value={selectedUser?.fullname || ''}
                onChange={handleInputChange}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <div className='d-flex border rounded'>
                <Form.Control
                  className='border-0 shadow-none'
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  value={selectedUser?.password || ''}
                  onChange={handleInputChange}
                  required
                />
                <span
                  className='mx-2 mt-1'
                  onClick={handlePasswordToggle}
                  style={{ cursor: 'pointer' }}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? <FaRegEye /> : <FaEyeSlash />}
                </span>
              </div>
            </Form.Group>
            <Modal.Footer>
              <Button variant="primary" type="submit">Save</Button>
            </Modal.Footer> 
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showImageModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>User Profile Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          <img src={selectedUser?.profileimage || ''} alt="Profile" style={{ maxWidth: '100%', height: 'auto' }} />
        </Modal.Body>
      </Modal>
      <PageCountStack
        filteredTickets={users}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
      <ToastContainer />
    </div>
  );
};

export default UserTable;
