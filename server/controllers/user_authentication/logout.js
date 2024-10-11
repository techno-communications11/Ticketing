const logout = (req, res) => {
   
    res.cookie('token', '', {
      httpOnly: true,
      maxAge: 0 
    });
  
    res.status(200).json({ message: "Logout successful" });
  };
  
  export default logout;
