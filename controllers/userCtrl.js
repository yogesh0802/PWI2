const userModel = require("../model/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorMode = require("../model/doctorModel");
const doctorModel = require("../model/doctorModel");
const appointmentModel = require("../model/appointmentModel");
const moment = require("moment");
// register callback
// first take password and bcrypyt it save it to database
const registerController = async (req, res) => {
  try {
    const exisiting = await userModel.findOne({ email: req.body.email });
    if (exisiting) {
      return res
        .status(200)
        .send({ message: "User Already exist", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(8);
    const hashedpassword = await bcrypt.hash(password, salt);
    req.body.password = hashedpassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Register successful", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `register controller ${error.message}`,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    const ispass = await bcrypt.compare(req.body.password, user.password);
    if (!ispass) {
      return res
        .status(200)
        .send({ message: "Incorrect Email or Password", success: false });
    }
    // create token {On what basis,time,key}
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `error in login ctrl ${error.message}` });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.password = undefined; //to hide the passwrd
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorMode({ ...req.body, status: "pending" });
    await newDoctor.save();
    // send message to admin about new doctor including name of doctor
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notification = adminUser.notification;
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has apply for doctor account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onclickPath: "/admin/doctors",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notification });
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied Successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "error while appling doctor" });
  }
};

// notification ctrl
const getAllNotificationCon = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;
    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = notification;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.states(500).message.send({
      message: "Error in Notification",
      success: false,
      error,
    });
  }
};
//delete notificatio
const deleteAllNotificationCon = async () => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};

// get all doctor for users
const getAllDoctorscon = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctor List",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while feteching doctor",
      error,
    });
  }
};

// booking appointnments
const bookAppoitmentcon = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();

    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    // to send notification
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notification.push({
      type: "New-Appointment-request",
      message: `A new Appointment request from ${req.body.userInfo.name}`,
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Book Sucessfully!!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while booking appointment",
    });
  }
};
// for booking avalibility
const bookingAvalibilitycon = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours") //for delay
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm")
      .add(1, "hours") //for delay
      .toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not Availibale at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointment available!!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

// to display the appointment list
const userAppointmentcon = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};
module.exports = {
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
};
