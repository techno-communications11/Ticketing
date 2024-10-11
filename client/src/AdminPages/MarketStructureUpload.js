import React, { useState, useRef } from 'react';
import { apiRequest } from '../lib/apiRequest';
import '../styles/loader.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileUploads from '../universalComponents/FileUploads';
import ReusableButtons from '../universalComponents/ReusableButtons';

export function MarketStructureUpload() {
  const BoiIDRef = useRef('');
  const dmNameRef = useRef('');
  const storeNameRef = useRef('');
  const marketRef = useRef('');
  const doorCodeRef = useRef('');
  const storeAddressRef = useRef('');
  const fileInputRef = useRef('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeForm, setActiveForm] = useState('Market Structure');
  const [isLoading, setIsLoading] = useState(false);
  const [boiIdError, setboiIdError] = useState('');
  const [dmnameError, setDmNameError] = useState('');
  const [storeNameError, setStoreNameError] = useState('');
  const [marketError, setMarketError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setboiIdError('');
    setDmNameError('');
    setStoreNameError('');
    setMarketError('');

    const boiId = BoiIDRef.current.value;
    const dmName = dmNameRef.current.value;
    const storeName = storeNameRef.current.value;
    const market = marketRef.current.value;
    const doorCode = doorCodeRef.current.value;
    const storeAddress = storeAddressRef.current.value;

    let hasError = false;
    if (!boiId) {
      setboiIdError('BDI ID is required');
      hasError = true;
    }
    if (!dmName) {
      setDmNameError('District Manager Name is required');
      hasError = true;
    }
    if (!storeName) {
      setStoreNameError('Store Name is required');
      hasError = true;
    }
    if (!market) {
      setMarketError('Market is required');
      hasError = true;
    }
    if (hasError) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest.post('/market/registermarket', { boiId, dmName, storeName, market, doorCode, storeAddress });
      if (response.status === 201) {
        setIsLoading(false);
        toast.success('Market registered successfully!');
      } else {
        setIsLoading(false);
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('An unexpected error occurred');
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.warn('Please select a file first.');
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await apiRequest.post('/market/excelSheet', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setSelectedFile("");
        toast.success('File uploaded successfully');
      } else {
        toast.error('File upload failed. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      {isLoading ? (
        <div className='vh-100'>
          <div className='loader d-flex align-items-center justify-content-center vh-80 '></div>
        </div>
      ) : (
        <div className="row  w-100 align-items-center justify-content-center">
          <div className="col-12 col-md-8 col-lg-10 col-xl-8 mt-3">
          <ReusableButtons bigText={'Register Market'}
             smallText={'Upload'} 
             setActiveForm={setActiveForm} 
             activeForm={activeForm}/>
            {activeForm === 'register' ? (
              <div className="container">
                <div className="row d-flex justify-content-center align-items-center">
                  <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                    <form onSubmit={handleSubmit} className="bg-body shadow-lg rounded p-4">
                      <div className="text-center mb-4">
                        <h4 className="font-family">Register Market</h4>
                      </div>
                      <div className="mb-3">
                        <input type="text" placeholder="Boi ID" className="form-control border shadow-none" ref={BoiIDRef} />
                        <span className="text-danger">{boiIdError}</span>
                      </div>
                      <div className="mb-3">
                        <input type="text" placeholder="District Manager Name" className="form-control border shadow-none" ref={dmNameRef} />
                        <span className="text-danger">{dmnameError}</span>
                      </div>
                      <div className="mb-3">
                        <input type="text" placeholder="Store Name" className="form-control border shadow-none" ref={storeNameRef} />
                        <span className="text-danger">{storeNameError}</span>
                      </div>
                      <div className="mb-3">
                        <input type="text" placeholder="Market" className="form-control border shadow-none" ref={marketRef} />
                        <span className="text-danger">{marketError}</span>
                      </div>
                      <div className="mb-3">
                        <input type="text" placeholder="Door Code" className="form-control border shadow-none" ref={doorCodeRef} />
                      </div>
                      <div className="mb-3">
                        <input type="text" placeholder="Store Address" className="form-control border shadow-none" ref={storeAddressRef} />
                      </div>
                      <div className="d-grid gap-2">
                        <button className="btn btn-primary" type="submit">Register</button>
                      </div>
                    </form>
                  </div>
                  <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 text-center">
                    <img src="./market.png" alt="Market" className="img-fluid d-none d-md-block" />
                  </div>
                </div>
              </div>

            ) : (
              <FileUploads
                handleFileUploadClick={handleFileUploadClick}
                handleFileChange={handleFileChange}
                handleFileUpload={handleFileUpload}
                handleSubmit={handleSubmit}
                selectedFile={selectedFile}
                fileInputRef={fileInputRef}
                isLoading={isLoading} />
            )}
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

