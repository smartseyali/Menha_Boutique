const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/jwt");
const { sendWelcomeEmail } = require("../services/emailService");

async function register(req, res, next) {
  try {
    const {
      phoneNumber,
      password,
      firstName,
      lastName,
      address,
      city,
      postCode,
      country,
      state,
      email,
      profilePhoto,
      description,
    } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Check if user already exists by phone number
    const existingUser = await User.findByPhoneNumber(phoneNumber);
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this phone number already exists" });
    }

    // Check if email is provided and user exists
    if (email) {
      const existingEmailUser = await User.findByEmail(email);
      if (existingEmailUser) {
        return res
          .status(409)
          .json({ message: "User with this email already exists" });
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate email from phoneNumber if not provided
    const userEmail = email || `${phoneNumber}@pattikadai.com`;

    // Create user
    const userData = {
      email: userEmail,
      passwordHash,
      firstName,
      lastName,
      phoneNumber,
      profilePhoto,
      description,
      role: req.body.role || "customer",
    };

    const user = await User.create(userData);

    // Create address if provided
    const Address = require("../models/Address");
    if (address && city && postCode && country && state) {
      try {
        await Address.create({
          userId: user.id,
          firstName,
          lastName,
          addressLine: address,
          city,
          postalCode: postCode,
          country,
          countryName: country,
          state,
          stateName: state,
          isDefault: true,
          addressType: "both", // both shipping and billing
        });
      } catch (addressError) {
        console.error(
          "Error creating address during registration:",
          addressError
        );
        // Continue even if address creation fails
      }
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      phoneNumber: user.phone_number,
    });

    // Remove password hash from response
    delete user.password_hash;

    // Send welcome email
    if (user.email && !user.email.endsWith('@pattikadai.com')) {
        sendWelcomeEmail(user).catch(err => console.error("Failed to send welcome email:", err));
    }

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { phoneNumber, password, email } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find user by phoneNumber (priority) or email
    let user = null;
    if (phoneNumber) {
      user = await User.findByPhoneNumber(phoneNumber);
    } else if (email) {
      user = await User.findByEmail(email);
    } else {
      return res
        .status(400)
        .json({ message: "Phone number or email is required" });
    }

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid phone number/email or password" });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ message: "Account is inactive" });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid phone number/email or password" });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      phoneNumber: user.phone_number,
    });

    // Remove password hash from response
    delete user.password_hash;

    res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, phoneNumber, profilePhoto, description } =
      req.body;

    const userData = {
      firstName,
      lastName,
      phoneNumber,
      profilePhoto,
      description,
    };

    const user = await User.update(req.userId, userData);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    // Since we're using JWT, logout is handled client-side by removing the token
    // However, we can implement token blacklisting here if needed
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout,
};
