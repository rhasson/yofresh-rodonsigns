var fork = require('child_process').fork;
var mail_proc = null;
var payment_proc = null;

exports.startWorker = function() {
  mail_proc = fork(__dirname + '/mail_process_main.js');

  mail_proc.on('error', function(err) {
    console.log('Mail child process ', mail_proc.pid, ' failed with error: ', err);
    mail_proc.disconnect();
    process.exit(1);
  });

  mail_proc.on('exit', function(code, signal) {
    console.log('Mail child process ', mail_proc.pid,' exited with: ', code, signal);
    mail_proc.disconnect();
  });

  mail_proc.on('close', function() {
    console.log('Mail child process ', mail_proc.pid, ' closed');
    mail_proc.disconnect();
    process.nextTick(function() {
      mail_proc = fork(process.cwd() + '/mail_process_main.js');
    });
  });


  payment_proc = fork(__dirname + '/payment_process_main.js');

  payment_proc.on('error', function(err) {
    console.log('Payment child process ', payment_proc.pid, ' failed with error: ', err);
    payment_proc.disconnect();
    process.exit(1);
  });

  payment_proc.on('exit', function(code, signal) {
    console.log('Payment child process ', payment_proc.pid,' exited with: ', code, signal);
    payment_proc.disconnect();
  });

  payment_proc.on('close', function() {
    console.log('Payment child process ', payment_proc.pid, ' closed');
    payment_proc.disconnect();
    process.nextTick(function() {
      payment_proc = fork(process.cwd() + '/payment_process_main.js');
    });
  });

  return {mail: mail_proc, payment: payment_proc};
}
