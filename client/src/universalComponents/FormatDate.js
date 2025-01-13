const formatDate = (dateString) => {
  const date = new Date(dateString);

  // Format date and time without seconds
  const formattedDate = date.toLocaleDateString(); // e.g., "1/8/2025"
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // e.g., "3:24 PM"

  // Combine date and time
  return `Date: ${formattedDate}, Time: ${formattedTime}`;
};

export default formatDate;
