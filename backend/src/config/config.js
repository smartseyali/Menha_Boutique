require("dotenv").config();

module.exports = {
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "pattikadai",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "PgAdmin@123",
  },
  jwt: {
    secret:
      process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || "development",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },
  payment: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || "",
      keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    },
    phonepe: {
      merchantId: process.env.PHONEPE_MERCHANT_ID || "",
      saltKey: process.env.PHONEPE_SALT_KEY || "",
      saltIndex: process.env.PHONEPE_SALT_INDEX || "1",
      environment: process.env.PHONEPE_ENVIRONMENT || "test",
      baseUrl:
        process.env.PHONEPE_ENVIRONMENT === "production"
          ? "https://api.phonepe.com/apis/hermes"
          : "https://api-preprod.phonepe.com/apis/pg-sandbox",
    },
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || "",
  },
};
