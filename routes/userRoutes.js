const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationCon,
  deleteAllNotificationCon,
  getAllDoctorscon,
  bookAppoitmentcon,
  bookingAvalibilitycon,
  userAppointmentcon,
} = require("../controllers/userCtrl");
const auth = require("../middlewares/auth");

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

// auth or homepage
router.post("/getUserData", auth, authController);
// doctor aplpy
router.post("/apply-doctor", auth, applyDoctorController);
// for notification
router.post("/get-all-notification", auth, getAllNotificationCon);
router.post("/delete-all-notification", auth, deleteAllNotificationCon);

// router get all doctor for user
router.get("/getAllDoctors", auth, getAllDoctorscon);

// book appointmnet
router.post("/book-appointment", auth, bookAppoitmentcon);

// to check availibility
router.post("/booking-availbility", auth, bookingAvalibilitycon);

// to show appointmenst
router.get("/user-appointments", auth, userAppointmentcon);

module.exports = router;
