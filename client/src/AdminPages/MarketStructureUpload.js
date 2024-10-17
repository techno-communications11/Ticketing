import React, { useState, useRef } from 'react';
import { apiRequest } from '../lib/apiRequest';
import '../styles/loader.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileUploads from '../universalComponents/FileUploads';
import ReusableButtons from '../universalComponents/ReusableButtons';
import Form from 'react-bootstrap/Form';

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
  const [errors, setErrors] = useState({
    boiId: false,
    dmName: false,
    storeName: false,
    market: false,
    doorCode: false,
    storeAddress: false,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const boiId = BoiIDRef.current.value;
    const dmName = dmNameRef.current.value;
    const storeName = storeNameRef.current.value;
    const market = marketRef.current.value;
    const doorCode = doorCodeRef.current.value;
    const storeAddress = storeAddressRef.current.value;

    const newErrors = {
      boiId: !boiId.trim(),
      dmName: !dmName.trim(),
      storeName: !storeName.trim(),
      market: !market.trim(),
      doorCode: !doorCode.trim(),
      storeAddress: !storeAddress.trim(),
    };


    const hasErrors = Object.values(newErrors).some((error) => error);
    if (hasErrors) {
      toast.error('Please fill out all required fields');
      return;
    }
    setErrors(newErrors);

    try {
      const response = await apiRequest.post('/market/registermarket', {
        boiId, dmName, storeName, market, doorCode, storeAddress
      });
      if (response.status === 201) {
        toast.success('Market registered successfully!');
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleFileUploadClick = () => { fileInputRef.current.click(); };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return;
    }
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
    }
  };

  return (
    <div className="container">
        <div className="row w-100 align-items-center justify-content-center">
          <div className="col-12 col-md-8 col-lg-10 col-xl-8 ">
            <ReusableButtons bigText={'Register Market'}
              smallText={'Upload'}
              setActiveForm={setActiveForm}
              activeForm={activeForm} />
            {activeForm === 'register' ? (
              <div className="container">
                <div className="row d-flex justify-content-center align-items-center">
                  <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                    <Form onSubmit={handleSubmit} className=" shadow-lg rounded p-4">
                      <div className="text-center mb-4">
                        <h4 className="font-family">Register Market</h4>
                      </div>
                      <Form.Group className="mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Boi ID"
                          ref={BoiIDRef}
                          isInvalid={errors.boiId}
                          className="border shadow-none"
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Control
                          type="text"
                          placeholder="District Manager Name"
                          ref={dmNameRef}
                          isInvalid={errors.dmName}
                          className="border shadow-none"
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Store Name"
                          ref={storeNameRef}
                          isInvalid={errors.storeName}
                          className="border shadow-none"
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Market"
                          ref={marketRef}
                          isInvalid={errors.market}
                          className="border shadow-none"
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Door Code"
                          ref={doorCodeRef}
                          isInvalid={errors.doorCode}
                          className="border shadow-none"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          placeholder="Store Address"
                          ref={storeAddressRef}
                          isInvalid={errors.storeAddress}
                          className="border shadow-none"
                        />
                      </Form.Group>
                      <div className="d-grid gap-2">
                        <button className="btn btn-primary" type="submit">Register</button>
                      </div>
                    </Form>
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
      <ToastContainer />
    </div>
  );
}
