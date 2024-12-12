import React, { useRef, useState, useEffect } from 'react';
import { FaRegEye, FaEyeSlash } from 'react-icons/fa';
import lottie from 'lottie-web';
// import animationData from '../universalComponents/Animation.json'; // Uncomment if using animation
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
    'NTID Mappings', 'Trainings', 'Accessories Order',
    'YUBI Key Setups', 'Charge Back/Commission',
    'Inventory', 'Maintenance', 'Admin',
    'Housing', 'CAM NW', 'HR Payroll',
  ];

  useEffect(() => {
    const animContainer = document.getElementById('animation-container');
    const animation = lottie.loadAnimation({
      container: animContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      // animationData, // Uncomment if using animation
    });

    return () => animation.destroy();
  }, []);

  const validateInputs = (ntid, password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]|\\:;'",.<>?/~`-])[A-Za-z\d!@#$%^&*()_+={}[\]|\\:;'",.<>?/~`-]{8,20}$/;

    let valid = true;
    // Uncomment and modify if NTID validation is required
    // const ntidRegex = /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d]{3,16}$/;
    // if (!ntidRegex.test(ntid)) {
    //   setNtidError('NTID should be 3-16 characters long and contain letters and digits.');
    //   valid = false;
    // }

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

    if (!validateInputs(ntid, password)) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await apiRequest.post('/auth/login', { ntid, password });
      const { token } = data;

      localStorage.setItem('token', token);
      const { department } = jwtDecode(token);
      localStorage.setItem('dept', department);

      const departmentRoutes = {
        'Employee': '/home',
        'District Manager': '/dmtabs',
        'Market Manager': '/markethome',
        'SuperAdmin': '/superAdminHome',
      };

      const route = departmentRoutes[department] || '/departmenthome';
      navigate(route);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container-fluid d-flex flex-column align-items-center justify-content-center mt-5'>
      {isLoading ? (
        <div className='loader d-flex align-items-center justify-content-center'></div>
      ) : (
        <>
          <div className='my-2 text-center mt-5'>
            <h2 className='fw-medium fs-3' style={{ color: '#E10174' }}>TECHNO COMMUNICATIONS LLC</h2>
          </div>

          <div className='row justify-content-center align-items-center w-100 mt-5'>
            <img className='col-12 col-md-6 col-lg-4 mb-4 d-none d-sm-block h-50 me-5' src='./logoT.png' alt="Logo" />

            <div className='col-12 mt-5 col-md-6 col-lg-4 d-flex justify-content-center align-items-center'>
              <form className='bg-white p-4 rounded box-shadow shadow-lg w-100' onSubmit={handleSubmit}>
                <h4 className='text-dark font-weight-bold d-flex justify-content-center'>Login</h4>

                <div className='my-3'>
                  <input
                    id='ntid'
                    type='text'
                    placeholder='Enter NTID / Email'
                    className='form-control border shadow-none'
                    ref={ntidRef}
                    aria-label='NTID'
                    autoComplete="username" // Added autocomplete
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
                    autoComplete="current-password" // Added autocomplete
                  />
                  <span
                    className='mx-2'
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    style={{ cursor: 'pointer' }}
                  >
                    {passwordVisible ? <FaRegEye /> : <FaEyeSlash />}
                  </span>
                </div>
                {passwordError && <span className='text-danger'>{passwordError}</span>}

                <div className='my-3'>
                  <button
                    type='submit'
                    className='btn btn-primary btn-block w-100'
                    disabled={isLoading}
                  >
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
