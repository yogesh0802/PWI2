const express = require("express");
const {
  getAllUsers,
  getAllDoctors,
  changeAccountStatuscon,
} = require("../controllers/adminCtrl");
const auth = require("../middlewares/auth");

const router = express.Router();

// get method for users to disply in users section for admin
router.get("/getAllUsers", auth, getAllUsers);
// for doctors to display
router.get("/getAllDoctors", auth, getAllDoctors);

// post change account status
router.post("/changeAccountStatus", auth, changeAccountStatuscon);

module.exports = router;
