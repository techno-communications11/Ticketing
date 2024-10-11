import React, { useRef, useState, useEffect } from 'react';
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';
import lottie from 'lottie-web';
import animationData from '../universalComponents/Animation.json';
import { apiRequest } from '../lib/apiRequest';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

export function Login() {
  const ntidRef = useRef(null);
  const passwordRef = useRef(null);
  const [ntidError, setNtidError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const Departments = [
    'Varun Team', 'NTID Mappings', 'Trainings', 'Accessories Order',
    'YUBI Key Setups', 'Deposits', 'Charge Back', 'Commission',
    'Inventory', 'Head Office', 'Admin Related', 'Maintenance Related',
    'Housing Related', 'CAM NW', 'HR Payroll', 
  ];

  useEffect(() => {
    const animContainer = document.getElementById('animation-container');
    const animation = lottie.loadAnimation({
      container: animContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
    });

    return () => animation.destroy();
  }, []);

  const validateInputs = (ntid, password) => {
    const ntidRegex = /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d]{3,16}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]|\\:;'",.<>?/~`-])[A-Za-z\d!@#$%^&*()_+={}[\]|\\:;'",.<>?/~`-]{8,20}$/;

    let valid = true;

    if (!ntidRegex.test(ntid)) {
      setNtidError('NTID should be 3-16 characters long and contain letters and digits.');
      valid = false;
    }

    if (!passwordRegex.test(password)) {
      setPasswordError('Password must be 8-20 characters with letters, digits, and special characters.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setNtidError('');
    setPasswordError('');
    setError('');

    const ntid = ntidRef.current.value.toLowerCase();
    const password = passwordRef.current.value;

    // Validate inputs
    if (!validateInputs(ntid, password)) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await apiRequest.post('/auth/login', { ntid, password });
      const { token } = data;

      localStorage.setItem('token', token);
      const { department } = jwtDecode(token);
      console.log(department, "dept")
      localStorage.setItem('dept', department)
      if (department === 'Employee' || department === 'District Manager') {
        navigate('/home');
      } else if (Departments.includes(department)) {
        navigate('/departmenthome');
      } else if (department==='Market Manager') {
        navigate('/markethome');
      } else {
        navigate('/superAdminHome');
      }
    } catch (error) {
      console.error('Login error:', error); // Additional logging
      setError(error.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container-fluid d-flex flex-column align-items-center justify-content-center mt-5'>
      {isLoading ? (
        <div className='loader d-flex align-items-center justify-content-center'>
        </div>
      ) : (
        <>
          <div className='my-2 text-center mt-5'>
            <h2 className='fw-bolder fs-3' style={{ color: '#E10174' }}>TECHNO COMMUNICATIONS LLC</h2>
          </div>

          <div className='row justify-content-center align-items-center w-100 mt-5'>
            <div id='animation-container' className='col-12 col-md-6 col-lg-4 mb-4 d-none d-sm-block'></div>

            <div className='col-12 col-md-6 col-lg-4'>
              <form className='bg-white p-4 rounded box-shadow shadow-lg w-100' onSubmit={handleSubmit}>
                <h4 className='text-dark font-weight-bold d-flex justify-content-center'>Login</h4>

                <div className='my-3'>
                  <input
                    id='ntid'
                    type='text'
                    placeholder='Enter NTID'
                    className='form-control border shadow-none'
                    ref={ntidRef}
                    aria-label='NTID'
                  />
                  {ntidError && <span className='text-danger'>{ntidError}</span>}
                </div>

                <div className='my-3 rounded bg-white border d-flex align-items-center'>
                  <input
                    id='password'
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder='Enter password'
                    className='form-control border-0 shadow-none flex-grow-1'
                    ref={passwordRef}
                    aria-label='Password'
                  />
                  <span className='mx-2' onClick={() => setPasswordVisible(!passwordVisible)} style={{ cursor: 'pointer' }}>
                    {passwordVisible ? <FaRegEye /> : <FaEyeSlash />}
                  </span>
                </div>
                {passwordError && <span className='text-danger'>{passwordError}</span>}

                <div className='my-3'>
                  <button type='submit' className='btn btn-primary btn-block w-100' disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                </div>

                {error && <p className='text-danger'>{error}</p>}
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
