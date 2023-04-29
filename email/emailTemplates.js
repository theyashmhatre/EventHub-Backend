const PORT = process.env.PORT || 3000;

module.exports = {

  confirm: id => ({
    subject: 'Confirmation Email',
    html: `
    <h1 align="center">Welcome to EventHub</h1>
      <a href='http://localhost:8000/${id}'>
        Click here to verify your account
      </a>
    `,
    text: `Copy and paste this link: http://localhost:8000/${id}`
  }),

  verified: () => ({
    subject: 'Your account has been verified!',
    html: `
    <h2 align="center">Welcome to URL Shortner</h2>
      <a href="https://ur1-sh.herokuapp.com" style="text-align:center">Visit URL Shortner</a>
    `,
    text: `Copy and paste this link: https://ur1-sh.herokuapp.com`
  }),

  deleted: () => ({
    subject: 'Your account has been successfully deleted!',
    html: `
    <h1 align="center">We'll miss you!</h1>
    <p>Account successfully deleted</p><br>
    <p>Regards,<br>URL Shortner Team</p>
      <a href="https://ur1-sh.herokuapp.com" align="left">URL Shortner</a>
    `,
    text: `Copy and paste this link: https://ur1-sh.herokuapp.com`
  }),

  passwordResetLink: (id, token) => ({
    subject: 'URL Shortner Password Reset',
    html: `
    <h1 align="center">Reset Password</h1>
      <a href='https://ur1-sh.herokuapp.com/password/reset/${id}/${token}'>
        Click here to reset your password
      </a>
    `,
    text: `Copy and paste this link: https://ur1-sh.herokuapp.com/password/reset/${id}/${token}`
  }),

  passwordResetDone: () => ({
    subject: 'Your password has been reset successfully!',
    html: `
    <h2 align="center">Password Reset Successful</h2>
      <a href="https://ur1-sh.herokuapp.com" style="text-align:center">Visit URL Shortner</a>
    `,
    text: `Copy and paste this link: https://ur1-sh.herokuapp.com`
  }),

};
