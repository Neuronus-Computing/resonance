import React from "react";
import { Link } from "react-router-dom";

const AuthFooter = ({ link = "/login", linkText = "Login", text = "Do you have an account?" }) => {
  return (
    <div className='termscondition'>
        <h4>{text} <Link to={link}>{linkText}</Link></h4>
    </div>
  );
};

export default AuthFooter;
