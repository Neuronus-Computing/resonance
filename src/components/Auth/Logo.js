import React from "react";
// import { Link } from "react-router-dom";
import { ReactComponent as LogoIcon } from "../../assets/images/logo.svg";

const Logo = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="authentication-page-content p-4 d-flex align-items-center min-vh-100">
      
      <div className="w-100 text-center ">
        <div className="row justify-content-center">
          <div className="left-side d-flex justify-content-center">
            {/* <img
              src={logo}
              alt=""
              className="auth-logo"
            /> */}
            <LogoIcon style={{ color: 'var(--skyblueTextLogo) !important'}} className="auth-logo"/> 
            <div className="left-page-cls">
              <h1 className="">RESONANCE</h1>
              <p className="text-muted">Send Your Message Secretly</p>
          </div>
          </div>
          <div className="plicy">
             <p className="msg-heading">Privacy Policy | Copyrights Reserved {currentYear}</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Logo;
