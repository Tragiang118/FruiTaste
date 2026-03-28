const axios = require('axios');

async function testDuplicateRegister() {
  const email = 'admin@fruitaste.com'; // Known existing
  try {
    console.log(`Attempting to register with ${email}...`);
    await axios.post('http://localhost:8000/api/auth/register', {
      email: email,
      password: 'newpassword123',
      fullName: 'Duplicate Tester'
    });
    console.log('UNEXPECTED: Registration succeeded!');
  } catch (error) {
    if (error.response) {
      console.log(`Expected Error: ${error.response.status} - ${error.response.data.message}`);
    } else {
      console.error('Request Error:', error.message);
    }
  }
}

testDuplicateRegister();