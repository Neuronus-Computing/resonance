import React from 'react';
import notFoundError from "../../assets/images/errors/404 error.svg";
const NotFound = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="display-4">
          <img src={notFoundError} className="w-100 h-100" alt="404"/>
        </div>
        <p className="lead"></p>
      </div>
    </div>
  );
};

export default NotFound;
