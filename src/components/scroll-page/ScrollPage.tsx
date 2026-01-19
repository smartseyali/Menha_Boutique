"use client"
import { useCallback } from "react";

const ScrollPage = () => {
  const scrollToPosition = useCallback(() => {
    window.scrollTo({ top: 1000, behavior: "smooth" });
  }, []);

  return (
    <div className="bb-scroll-Page">
      <span className="scroll-bar">
        <a href="#" onClick={(e) => { e.preventDefault(); scrollToPosition(); }}>
          Scroll Page
        </a>
      </span>
    </div>
  );
};

export default ScrollPage;