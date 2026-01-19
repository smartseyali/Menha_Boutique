import { useState } from "react";

const Loader = () => {
  const [showLoader] = useState(true);

  return (
    <>
      {showLoader && (
        <div className="bb-loader">
          <img src="/assets/img/logo/logo.gif" alt="loader" />
          <span className="loader"></span>
        </div>
      )}
    </>
  );
};

export default Loader;
