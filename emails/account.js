const sgMail = require("@sendgrid/mail");

const sendgridAPIKey =
  "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";

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email, name) => {
  sgMail
    .send({
      to: email,
      from: "prudhviraj.j16@iiits.in",
      subject: "This is test",
      text: `Hii ${name}, no worries this mail is only for testing`,
    })
    .then((res) => console.log("res"))
    .catch((err) => console.log(err));
};

const sendCancelEmail = (email, name) => {
  sgMail
    .send({
      to: 'azharali.m@dwpglobalcorp.com',
      from: "prudhviraj.j16@iiits.in",
      subject: "This is test",
      text: `Hii ${name}, no worries this mail is only for deleting account, which you have requested`,
    })
    .then((res) => console.log("res"))
    .catch((err) => console.log(err));
};

// sgMail.send(message)
module.exports = {
  sendWelcomeEmail,sendCancelEmail
};
