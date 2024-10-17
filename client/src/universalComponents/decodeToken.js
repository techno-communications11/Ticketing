import { jwtDecode } from "jwt-decode";

const getDecodedToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("No token found in localStorage");
        return null;
    }
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

export default getDecodedToken;
