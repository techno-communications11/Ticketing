
const formatDate = (dateString) => {
    const date = new Date(dateString);
    // const hours = date.getHours() % 12 || 12;
    // const minutes = date.getMinutes().toString().padStart(2, '0');
    // const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `Date: ${date.toLocaleDateString()}`
    
    //  Time: ${hours}:${minutes} ${ampm}
    
    ;
  };
  export default formatDate