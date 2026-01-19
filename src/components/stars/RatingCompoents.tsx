import { useEffect, useState } from "react";

const RatingComponent = ({ onChange, value }: any) => {
  const [currentRating, setCurrentRating] = useState(value);

  useEffect(() => {
    setCurrentRating(value);
  }, [value]);

  // Function to handle mouse click on a star
  const handleClick = (rating: number) => {
    setCurrentRating(rating);
    onChange(rating);
  };

  return (
    <div className="bb-review-rating">
      <span>Your rating:</span>
      <div className="bb-pro-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`ri-star-${currentRating >= star ? "fill" : "line"
              }`}
            onClick={() => handleClick(star)}
          ></i>
        ))}
      </div>
    </div>
  );
};

export default RatingComponent;
