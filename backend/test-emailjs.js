import emailjs from 'emailjs-com';

const SERVICE_ID = 'service_vibe01';
const TEMPLATE_ID = 'template_z4r863i';
const PUBLIC_KEY = 'Fj5BK_cUH9Vp2Rxuc';

console.log('Testing EmailJS Configuration...');
console.log('SERVICE_ID:', SERVICE_ID);
console.log('TEMPLATE_ID:', TEMPLATE_ID);
console.log('PUBLIC_KEY:', PUBLIC_KEY);

emailjs.init(PUBLIC_KEY);

const templateParams = {
  to_email: 'test@example.com',
  to_name: 'test',
  otp_code: '123456',
  user_email: 'test@example.com',
};

console.log('\nAttempting to send test email...');

emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
  .then((response) => {
    console.log('✅ SUCCESS! Email sent.');
    console.log('Response:', response);
  })
  .catch((error) => {
    console.error('❌ FAILED! Error sending email:');
    console.error('Status:', error.status);
    console.error('Text:', error.text);
    console.error('Message:', error.message);
    console.error('\nFull error:', error);
  });
