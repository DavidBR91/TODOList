var nodemailer = require('nodemailer');

// Create a SMTP transport object
var transport = nodemailer.createTransport("SMTP", {
  service:'Gmail', // use well known service
  auth:{
    user:"todolistis@gmail.com",
    pass:"equipoa2013"
  }
});

console.log('SMTP Configured');

var sendEmail = function (to, env_username, rec_user, acc_rej) {
  var message = {
    // sender info
    from:'TODOLIST <todolistid@gmail.com>',
    // Comma separated list of recipients
    to:to,
    // Subject of the message
    subject:'Nueva notificación de usuario', //
    // plaintext body
    text:'Hola '+ env_username + ', \nEl usuario ' + rec_user + ' ha ' + acc_rej + ' tu envio de tareas'
  };

  console.log('Sending Mail');
  transport.sendMail(message, function (error) {
    if (error) {
      console.log('Error occured');
      console.log(error.message);
      return;
    }
    console.log('Message sent successfully!');
  });
}

exports.sendEmail = sendEmail;