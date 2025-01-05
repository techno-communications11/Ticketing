import React, { useState, useRef } from "react";
import { apiRequest } from "../lib/apiRequest";
import "../styles/loader.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FileUploads from "../universalComponents/FileUploads";
import ReusableButtons from "../universalComponents/ReusableButtons";
import Form from "react-bootstrap/Form";

export function MarketStructureUpload() {
  const BdiIDRef = useRef("");
  const dmNameRef = useRef("");
  const storeNameRef = useRef("");
  const marketRef = useRef("");
  const doorCodeRef = useRef("");
  const storeAddressRef = useRef("");
  const fileInputRef = useRef("");

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState("Market Structure");
  const [errors, setErrors] = useState({
    bdiId: false,
    dmName: false,
    storeName: false,
    market: false,
    doorCode: false,
    storeAddress: false,
  });

  const handleSubmit = async (event) => {
    
    event.preventDefault();

    const bdiId = BdiIDRef.current.value.trim();
    const dmName = dmNameRef.current.value.trim();
    const storeName = storeNameRef.current.value.trim();
    const market = marketRef.current.value.trim();
    const doorCode = doorCodeRef.current.value.trim();
    const storeAddress = storeAddressRef.current.value.trim();

    const newErrors = {
      bdiId: !bdiId,
      dmName: !dmName,
      storeName: !storeName,
      market: !market,
      // doorCode: !doorCode,
      storeAddress: !storeAddress,
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error);
    if (hasErrors) {
      toast.error("Please fill out all required fields");
      return;
    }
    setLoading(true);

    try {
      const response = await apiRequest.post("/market/registermarket", {
        bdiId,
        dmName,
        storeName,
        market,
        doorCode,
        storeAddress,
      });

      if (response.status === 201) {
        toast.success("Market registered successfully!");
      } else {
        console.log(response.data?.message)
        // toast.error(response.data?.message || 'Failed to register market');
      }
    } catch (error) {
      console.error("Error details:", error.response?.data || error.message);
      // toast.error(
      //   error.response?.data?.message || "An unexpected error occurred"
      // );
    } finally {
      BdiIDRef.current.value = "";
      dmNameRef.current.value = "";
      storeNameRef.current.value = "";
      marketRef.current.value = "";
      doorCodeRef.current.value = "";
      storeAddressRef.current.value = "";
      setLoading(false);
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
      toast.error("Please select a file first.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await apiRequest.post("/market/excelSheet", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setSelectedFile("");
        toast.success("File uploaded successfully");
      } else {
        toast.error("File upload failed. Please try again.");
      }
    } catch (error) {
      console.log("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row w-100 align-items-center justify-content-center">
        <div className="col-12 col-md-8 col-lg-10 col-xl-8 ">
          <ReusableButtons
            bigText={"Register Store"}
            smallText={"Upload"}
            setActiveForm={setActiveForm}
            activeForm={activeForm}
          />
          {activeForm === "register" ? (
            <div className="container">
              <div className="row d-flex justify-content-center align-items-center">
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                  <Form
                    onSubmit={handleSubmit}
                    className="shadow-lg rounded p-4"
                  >
                    <div className="text-center mb-4">
                      <h5 className="font-family">Register Store</h5>
                    </div>
                    <Form.Group className="mb-2">
                      <Form.Control
                        type="text"
                        placeholder="Bdi ID"
                        ref={BdiIDRef}
                        isInvalid={errors.bdiId}
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
                      <Form.Select
                        ref={marketRef}
                        isInvalid={errors.market}
                        className="border shadow-none"
                        aria-label="Select Market"
                      >
                        <option value="">Select Market</option>
                        {markets.map((market) => (
                          <option
                            className="text-capitalize"
                            key={market._id}
                            value={market.market}
                          >
                            {market.market}
                          </option>
                        ))}
                      </Form.Select>
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
                      <button className="btn btn-primary" type="submit">
                        {loading ? (
                          <div class="spinner-border text-muted"></div>
                        ) : (
                          "Register"
                        )}
                      </button>
                    </div>
                  </Form>
                </div>
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 text-center">
                  <img
                    src="./market.png"
                    alt="Market"
                    className="img-fluid d-none d-md-block"
                  />
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
              loading={loading}
            />
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
