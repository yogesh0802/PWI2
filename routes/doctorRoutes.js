const express = require("express");
const {
  getDoctorInfo,
  updateProfile,
  getDoctorId,
  doctorAppointmentcon,
  updateStatus,
} = require("../controllers/doctorCtrl");
const auth = require("../middlewares/auth");
const router = express.Router();

// post the doctor information for updating the profile
router.post("/getDoctorInfo", auth, getDoctorInfo);
// post update profile
router.post("/updateProfile", auth, updateProfile);

// for booking appointment
router.post("/getDoctorId", auth, getDoctorId);

// to show appoitments
router.get("/doctor-appointments", auth, doctorAppointmentcon);

// to accept or reject the appointment
router.post("/update-status", auth, updateStatus);

module.exports = router;
