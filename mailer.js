var email = require('mailer');


var sendEmail = function (to, env_username, rec_user, acc_rej) {
  email.send({
      host:"smtp.sendgrid.net",
      port:"25",
      domain:"smtp.sendgrid.net",
      authentication:"login",
      username:(new Buffer("fgodino")).toString("base64"),
      password:(new Buffer("equipoa")).toString("base64"),
      to:to,
      from:"test@mydomain.com",
      subject:"Notificación de envio de tareas",
      template:"./email_template.txt", // path to template name
      data:{
        "rec_username":rec_user,
        "env_username":env_username,
        "acc_rej":acc_rej
      }
    },
    function (err, result) {
      if (err) {
        console.log(err);
      }
    });
};

exports.sendEmail = sendEmail;