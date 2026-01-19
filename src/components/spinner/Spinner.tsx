import React, { CSSProperties } from 'react'
import FadeLoader from 'react-spinners/FadeLoader';

const override: CSSProperties = {
  display: "block",
  margin: "2px",
};

const Spinner = () => {
  return (
    <div style={{ height: "450px", display: "flex", justifyContent: "center", alignItems: "center", opacity: "0.7" }} className="sweet-loading">
      <FadeLoader
        cssOverride={override}
        color='#6c7fd8'
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  )
}

export default Spinner


