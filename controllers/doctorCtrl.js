const doctorModel = require("../model/doctorModel");
const appointmentModel = require("../model/appointmentModel");
const userModel = require("../model/userModels");

const getDoctorInfo = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Doctor Data fetched successfully ",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.send(500).send({
      success: false,
      message: "Error While fetching Details",
      error,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(201).send({
      success: true,
      message: "Doctor Profile Updated Successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Doctor profile update probem",
      error,
    });
  }
};
// get singe doctor for appointment
const getDoctorId = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Doctor Info fetched ",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Single doctor info while booking",
    });
  }
};
// to get all appointemnst
const doctorAppointmentcon = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    const appointements = await appointmentModel.find({
      doctorId: doctor._id,
    });
    res.status(200).send({
      success: true,
      message: "Doctor Appointments fetched successfully ",
      data: appointements,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Doctor appointments",
    });
  }
};

// to update the stauts of appoitnemnest
const updateStatus = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointments = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status }
    );
    const user = await userModel.findOne({ _id: appointments.userId });
    const notification = user.notification;
    notification.push({
      type: "status-updated",
      message: `Your appointment has been updated ${status}`,
      onCLickPath: "/doctor-appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in update status",
    });
  }
};
module.exports = {
  getDoctorInfo,
  updateProfile,
  getDoctorId,
  doctorAppointmentcon,
  updateStatus,
};
