
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `Date: ${date.toLocaleDateString()}`
    ;
  };
  export default formatDate