const sgMail = require('@sendgrid/mail')
const auth = require('../config/auth.js');
sgAPI = auth.sendGrid.apiKey;
sgMail.setApiKey(sgAPI);

// SendMail module
// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs'
function sendMail(user, task) {
    console.log("TESTMAIL", JSON.stringify(user), JSON.stringify(task))
    const msg = {
        to: user.googleemail, // Change to your recipient
        from: 'botherme@brandeis.edu',
        subject: `Reminder for task: ${task.task}`,
        text: `Hello ${user.googlename},\nThis is a reminder to do your task: ${task.task}
      \nMake sure you get it done by ${task.time}!
      \nBe Productive,\nBotherMe Team`,
        html: `<body>Hello ${user.googlename},</p><p style="padding:12px;border-left:4px solid #d0d0d0;font-style:italic">
        This is a reminder to ${task.task} by ${task.time}.</p><p>Be Productive,<br>BotherMe Team</p></body>`,
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log(`Email sent to ${user.googleemail}`)
        })
        .catch((error) => {
            console.error(error)
        })
}

module.exports = sendMail;