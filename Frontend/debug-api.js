const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing Login with wrong email...');
    await axios.post('http://localhost:8000/api/auth/login', {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    });
    console.log('Login succeeded (unexpected)');
  } catch (error) {
    if (error.response) {
      console.log('Login Status:', error.response.status);
      console.log('Login Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Login Error:', error.message);
    }
  }
}

testRegister();
testLogin();