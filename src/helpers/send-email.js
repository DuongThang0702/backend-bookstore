import nodemailer from "nodemailer";

const sendMail = async ({ email, html }) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_NAME, // generated ethereal user
      pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"BookStore" <no-reply@bookstore.com>', // sender address
    to: email, // list of receivers
    subject: "Forgot password", // Subject line
    html: html, // html body
  });

  return info;
};

export default sendMail;