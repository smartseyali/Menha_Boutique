"use client"
import React from "react";

interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const stars: React.ReactElement[] = [];

  for (let i = 0; i < 5; i++) {
    const isFilled = i < rating;
    stars.push(
      <i key={i} className={`ri-star-${isFilled ? "fill" : "line"}`}></i>
    );
  }

  return <span className="bb-pro-rating">{stars}</span>;
};

export default StarRating;

