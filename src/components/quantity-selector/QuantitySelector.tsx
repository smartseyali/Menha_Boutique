"use client"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { updateCartItemQuantity } from "@/utils/cartOperations";
import { showErrorToast } from "../toast-popup/Toastify";
import { authStorage } from "@/utils/authStorage";

const QuantitySelector = ({
  id,
  quantity,
  setQuantity,
  cartItemId,
}: {
  id: number | string;
  quantity: number;
  setQuantity?: any;
  cartItemId?: string; // cart_item.id from database for API operations
}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart?.items || []);

  const handleQuantityChange = async (operation: "increase" | "decrease") => {
    let newQuantity = quantity;
    if (operation === "increase") {
      newQuantity = quantity + 1;
    } else if (operation === "decrease" && quantity > 1) {
      newQuantity = quantity - 1;
    }
    
    if (undefined !== setQuantity) {
      // For product page or other non-cart contexts
      setQuantity(newQuantity);
    } else {
      // For cart operations - use API
      try {
        // Find cartItemId from cart items if not provided
        const item = cartItems.find((item: any) => item.id === id || item.productId === id);
        const itemCartId = cartItemId || item?.cartItemId;
        
        if (itemCartId) {
          await updateCartItemQuantity(dispatch, itemCartId, newQuantity, cartItems);
        } else {
          // Check if guest user - use product ID as cart ID
          if (!authStorage.isAuthenticated()) {
             const guestId = id?.toString();
             if (guestId) {
                 await updateCartItemQuantity(dispatch, guestId, newQuantity, cartItems);
                 return;
             }
          }
          console.error('Cart item ID not found for quantity update');
          showErrorToast('Failed to update quantity');
        }
      } catch (error: any) {
        console.error('Error updating quantity:', error);
        showErrorToast(error.message || 'Failed to update quantity');
      }
    }
  };

  return (
    <>
      <div className='bb-qtybtn'
        onClick={() => handleQuantityChange("decrease")}
      >
        -
      </div>
      <input
        readOnly
        className="qty-input location-select"
        type="text"
        name="gi-qtybtn"
        value={quantity}
      />
      <div className='bb-qtybtn'
        onClick={() => handleQuantityChange("increase")}
      >
        +
      </div>
    </>
  );
};

export default QuantitySelector;
