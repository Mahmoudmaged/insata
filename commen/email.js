const nodemailer = require("nodemailer");

async function sendEmail(dest, message , attachment) {


    let attach =[];
    if(attachment){
        attach  = attachment
    }
    let transporter = nodemailer.createTransport({
        port: 587 || 50000,
        secure: false, // true for 465, false for other ports
        service:'gmail',
        auth: {
            user:process.env.senderEmail, // generated ethereal user
            pass:process.env.senderPassWord, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"Fred Foo 👻" <${process.env.senderEmail}>`, // sender address
        to: dest, // list of receivers
        subject: "confirmationEmail ✔", // Subject line
        attachments :attach,
        text: "hello confirmation email", // plain text body
        html: message, // html body
    });

}

module.exports = sendEmail