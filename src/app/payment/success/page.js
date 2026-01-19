"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { paymentApi, orderApi } from "@/utils/api";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/toast-popup/Toastify";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";

const PaymentSuccess = () => {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment details from URL params using window location (client-side)
        const params = new URLSearchParams(window.location.search);
        const gateway = params.get("gateway");
        const orderIdParam = params.get("order_id");
        const paymentId = params.get("payment_id");
        const signature = params.get("signature");
        const merchantTransactionId = params.get("merchantTransactionId");

        if (!gateway) {
          setVerificationStatus("error");
          setVerifying(false);
          showErrorToast("Invalid payment response");
          return;
        }

        // Verify payment
        if (gateway === "razorpay" && paymentId && signature && orderIdParam) {
          setOrderId(orderIdParam);
          // Verify Razorpay payment
          const verificationResult = await paymentApi.verifyPayment({
            orderId: orderIdParam,
            gateway: "razorpay",
            paymentData: {
              razorpay_order_id: orderIdParam,
              razorpay_payment_id: paymentId,
              razorpay_signature: signature,
            },
          });

          if (verificationResult.success) {
            setVerificationStatus("success");
            showSuccessToast("Payment verified successfully!");
            setTimeout(() => {
              router.push("/orders");
            }, 2000);
          } else {
            setVerificationStatus("error");
            showErrorToast("Payment verification failed");
          }
        } else if (gateway === "phonepe") {
          // PhonePe sends response as base64 encoded string in response parameter
          const params = new URLSearchParams(window.location.search);
          const responseParam = params.get("response");

          if (responseParam) {
            try {
              // Decode the base64 response (browser compatible)
              const decodedString = atob(responseParam);
              const decodedResponse = JSON.parse(decodedString);
              const txId =
                decodedResponse.data?.transactionId ||
                decodedResponse.merchantTransactionId;

              if (txId || decodedResponse.merchantTransactionId) {
                const merchantTxId =
                  decodedResponse.merchantTransactionId || txId;

                // First, get the order by transaction ID
                try {
                  const order = await orderApi.getByTransactionId(merchantTxId);
                  if (order && order.id) {
                    setOrderId(order.id);

                    // Verify PhonePe payment using the order ID
                    const verificationResult = await paymentApi.verifyPayment({
                      orderId: order.id,
                      gateway: "phonepe",
                      paymentData: {
                        merchantTransactionId: merchantTxId,
                        transactionId: txId,
                      },
                    });

                    if (verificationResult.success) {
                      setVerificationStatus("success");
                      showSuccessToast("Payment verified successfully!");
                      setTimeout(() => {
                        router.push("/orders");
                      }, 2000);
                    } else {
                      setVerificationStatus("error");
                      showErrorToast("Payment verification failed");
                    }
                  } else {
                    setVerificationStatus("error");
                    showErrorToast("Order not found for this transaction");
                  }
                } catch (orderError) {
                  console.error("Error getting order:", orderError);
                  setVerificationStatus("error");
                  showErrorToast("Failed to find order for this transaction");
                }
              } else {
                setVerificationStatus("error");
                showErrorToast("Invalid payment response from PhonePe");
              }
            } catch (error) {
              console.error("Error decoding PhonePe response:", error);
              setVerificationStatus("error");
              showErrorToast("Failed to process payment response");
            }
          } else {
            setVerificationStatus("error");
            showErrorToast("No payment response received");
          }
        } else {
          setVerificationStatus("error");
          showErrorToast("Invalid payment parameters");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setVerificationStatus("error");
        showErrorToast(error.message || "Payment verification failed");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [router]);

  return (
    <>
      <Breadcrumb title="Payment Status" />
      <section className="section-checkout padding-tb-50">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div
                className="payment-status-card"
                style={{
                  padding: "40px",
                  background: "#fff",
                  borderRadius: "10px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}
              >
                {verifying ? (
                  <>
                    <div
                      className="spinner-border text-primary"
                      role="status"
                      style={{ marginBottom: "20px" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h3>Verifying Payment...</h3>
                    <p>Please wait while we verify your payment.</p>
                  </>
                ) : verificationStatus === "success" ? (
                  <>
                    <div
                      style={{
                        fontSize: "60px",
                        color: "#28a745",
                        marginBottom: "20px",
                      }}
                    >
                      ✓
                    </div>
                    <h3 style={{ color: "#28a745", marginBottom: "15px" }}>
                      Payment Successful!
                    </h3>
                    <p style={{ marginBottom: "20px" }}>
                      Your payment has been verified successfully.
                    </p>
                    <p style={{ color: "#666" }}>
                      Redirecting to orders page...
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: "60px",
                        color: "#dc3545",
                        marginBottom: "20px",
                      }}
                    >
                      ✗
                    </div>
                    <h3 style={{ color: "#dc3545", marginBottom: "15px" }}>
                      Payment Verification Failed
                    </h3>
                    <p style={{ marginBottom: "20px" }}>
                      There was an issue verifying your payment.
                    </p>
                    <button
                      onClick={() => router.push("/orders")}
                      className="bb-btn-2"
                      style={{ marginTop: "20px" }}
                    >
                      Go to Orders
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentSuccess;
