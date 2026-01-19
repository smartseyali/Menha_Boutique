import React, { useState } from "react";

const DiscountCoupon = ({ onDiscountApplied }: any) => {
  const [isBtnVisible, setIsBtnVisible] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const handleApplyDiscount = (e: any) => {
    e.preventDefault()

    if (couponCode === "") {
      setErrorMessage("Coupon code cannot be empty");
      setDiscount(0);
    } else if (couponCode === "SAVE10") {
      setDiscount(10); // 10% discount
      setErrorMessage("");
      setIsBtnVisible(false);
    } else if (couponCode === "SAVE20") {
      setDiscount(20); // 20% discount
      setErrorMessage("");
      setIsBtnVisible(false);
    } else {
      setDiscount(0); // No discount
      setErrorMessage("Discount Coupon can not exceed");
    }
    // onDiscountApplied(discount);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setIsBtnVisible(true);
    setErrorMessage("");
    onDiscountApplied(discount);
  };

  return (
    <>
      <li>
        {isBtnVisible ? (<div className="coupon-down-box">
          <form method="post">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="bb-coupon" type="text" placeholder="Coupon Code" required />
            <button onClick={handleApplyDiscount} className="bb-btn-2 rtl-btn" type="submit">Apply</button>
          </form>
        </div>) : (
          <>
            <div className="bb-pro-variation">
              <ul>
                <li className="active">
                  <a onClick={handleRemoveCoupon} className="bb-opt-sz"
                    data-tooltip="Small">{couponCode} <i style={{ fontSize: '14px' }} className="ri-close-line"></i></a>
                </li>
              </ul>
            </div>
          </>
        )
        }
      </li>
      {errorMessage && (
        <div className="mt-2 text-red-500">{errorMessage}</div>
      )}
      {discount > 0 && discount <= 100 && (
        <div className="mt-2 text-green-500">
          Discount applied! You get a {discount}% discount.
        </div>
      )}
      {discount > 100 && (
        <div className="mt-2 text-red-500">
          Discount Coupon can not exceed.
        </div>
      )}
    </>
  );
};

export default DiscountCoupon;
