const sgMail = require('@sendgrid/mail')
const auth = require('../config/auth.js');
sgAPI = auth.sendGrid.apiKey;
sgMail.setApiKey(sgAPI);

// SendMail module
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs'
function sendMail(what, when) {
    console.log("TESTMAIL", JSON.stringify(what.task), when)
    const msg = {
        to: what.email, // Change to your recipient
        from: 'botherme@brandeis.edu',
        subject: `Reminder for task: ${what.task}`,
        sendAt: Math.floor(when.getTime() / 1000),
        text: `Hello ${what.name},\nThis is a reminder to do your task: ${what.task}
      \nMake sure you get it done by ${what.time}!
      \nBe Productive,\nBotherMe Team`,
        html: `<body>Hello ${what.name},</p><p style="padding:12px;border-left:4px solid #d0d0d0;font-style:italic">
        This is a reminder to ${what.task} by ${what.time}.</p><p>Be Productive,<br>BotherMe Team</p></body>`,
        batchId: 'dev_data',
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log(`Email sent to ${what.email}.`);
            console.log(`Payload: ${JSON.stringify(msg)}`)
        })
        .catch((error) => {
            console.error(error)
        })
}

module.exports = sendMail;