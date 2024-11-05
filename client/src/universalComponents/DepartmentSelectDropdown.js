import { useRef } from "react";
import Form from "react-bootstrap/Form";
import { useOutsideClick } from "./useOutsideClick"; // Custom hook to close dropdown when clicking outside

function DepartmentSelectDropdown({
  isFilterVisible,
  setIsFilterVisible,
  selectedDepartments,
  setSelectedDepartments,
  setCurrentPage
}) {
  const dropdownRef = useRef(null);
  const departmentData = [
    { department: "Trainings" },
    { department: "YUBI Key Setups" },
    { department: "NTID Mappings" },
    { department: "District Manager" },
    { department: "Maintenance" },
    // Add more departments as needed
  ];

  useOutsideClick(dropdownRef, () => setIsFilterVisible(false));

  const handleDepartmentChange = (event) => {
    const value = event.target.value;

    // Toggle department selection
    if (selectedDepartments.includes(value)) {
      // If the department is already selected, remove it
      setSelectedDepartments(
        selectedDepartments.filter((dept) => dept !== value)
       
      );
      setCurrentPage(1)
    } else {
      // If it is not selected, add it
      setSelectedDepartments([...selectedDepartments, value]);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all departments
      setSelectedDepartments(departmentData.map((dept) => dept.name));
      setCurrentPage(1)
    } else {
      // Deselect all departments
      setSelectedDepartments([]);
    }
  };

  // Logic to determine if all departments are selected
  const isAllSelected =
    selectedDepartments.length === departmentData.length &&
    departmentData.length > 0;

  return (
    <div className="position-relative" ref={dropdownRef}>
      {isFilterVisible && (
        <div
          className="dropdown-menu p-3 shadow"
          style={{
            display: "block",
            width: "15rem",
            maxHeight: "20rem",
            overflowY: "auto",
            borderRadius: "5px",
          }}
        >
          <Form.Check
            type="checkbox"
            label="Select All"
            checked={isAllSelected}
            onChange={handleSelectAll}
            className="mb-2 fw-medium text-primary"
          />
          {departmentData.map((market) => (
            <Form.Check
              type="checkbox"
              key={market.department}
              label={market.department}
              value={market.department}
              checked={selectedDepartments.includes(market.department)}
              onChange={handleDepartmentChange}
              className="mb-1 fw-medium text-primary text-capitalize fw-bolder shadow-lg dropdown-item"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DepartmentSelectDropdown;
