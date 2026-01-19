"use client"
import React, { useEffect, useState } from 'react'

const ScrollButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [pathLength, setPathLength] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const progressPath = document.querySelector('.back-to-top-wrap path') as SVGPathElement | null;
    if (progressPath) {
      const length = progressPath.getTotalLength();
      setPathLength(length);

      progressPath.style.transition = 'none';
      progressPath.style.strokeDasharray = `${length} ${length}`;
      progressPath.style.strokeDashoffset = `${length}`;
      progressPath.getBoundingClientRect();
      progressPath.style.transition = 'stroke-dashoffset 10ms linear';

      // Handle scroll events
      const handleScroll = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = pathLength - (scrollTop * pathLength) / docHeight;

        progressPath.style.strokeDashoffset = `${progress}`;

        setIsVisible(scrollTop > 50);

        if (scrollTop > 50) {
          setOffset(1);
        } else {
          setOffset(0);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [pathLength]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <a style={{ display: isVisible ? "block" : "none" }} href="#Top" onClick={scrollToTop} className="back-to-top result-placeholder">
      <i className="ri-arrow-up-line"></i>
      <div className={`back-to-top-wrap ${offset ? "active-progress" : ""}`}>
        <svg viewBox="-1 -1 102 102">
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"></path>
        </svg>
      </div>
    </a>
  )
}

export default ScrollButton
