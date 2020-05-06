const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API);
const SendWelcome=(email,name)=>{
    sgMail.send({
        from: "aggshweta29@gmail.com",
        to: email,
        subject: "Welcome To JB's Company",
        text: `Heyy I am assistant of Jaskaran Batra, Hope you will Enjoy our app ${name}`
    })
}

const sendCancel=(email,name)=>{
    sgMail.send({
        from: "aggshweta29@gmail.com",
        to: email,
        subject: "Good Bye "+name,
        text: `Heyy I am assistant of Jaskaran Batra, How we will see you soon again ${name}`
    });
}
module.exports={
    SendWelcome,
    sendCancel
}