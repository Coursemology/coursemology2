import { defineMessages } from 'react-intl';

const translations = defineMessages({
  emailAddress: {
    id: 'users.emailAddress',
    defaultMessage: 'Email address',
  },
  password: {
    id: 'users.password',
    defaultMessage: 'Password',
  },
  signInToYourAccount: {
    id: 'users.signInToYourAccount',
    defaultMessage: 'Sign in to Coursemology',
  },
  signIn: {
    id: 'users.signIn',
    defaultMessage: 'Sign in',
  },
  dontYetHaveAnAccount: {
    id: 'users.dontYetHaveAnAccount',
    defaultMessage: "Don't yet have an account?",
  },
  signUp: {
    id: 'users.signUp',
    defaultMessage: 'Sign up',
  },
  forgotPassword: {
    id: 'users.forgotPassword',
    defaultMessage: 'Forgot password',
  },
  resendConfirmationEmail: {
    id: 'users.resendConfirmationEmail',
    defaultMessage: 'Resend confirmation email',
  },
  troubleSigningIn: {
    id: 'users.troubleSigningIn',
    defaultMessage: 'Trouble signing in?',
  },
  alreadyHaveAnAccount: {
    id: 'users.alreadyHaveAnAccount',
    defaultMessage: 'Already have an account?',
  },
  createAnAccount: {
    id: 'users.createAnAccount',
    defaultMessage: 'Create a new account',
  },
  createAnAccountSubtitle: {
    id: 'users.createAnAccountSubtitle',
    defaultMessage:
      'Join students and teachers in a universe of fun online education!',
  },
  name: {
    id: 'users.name',
    defaultMessage: 'Name',
  },
  confirmPassword: {
    id: 'users.confirmPassword',
    defaultMessage: 'Confirm password',
  },
  rememberMe: {
    id: 'users.rememberMe',
    defaultMessage: 'Remember me on this device',
  },
  rememberMeHint: {
    id: 'users.rememberMeHint',
    defaultMessage: 'Only use this on your personal devices.',
  },
  signUpAgreement: {
    id: 'users.signUpAgreement',
    defaultMessage:
      'By signing up, you agree to our <tos>Terms of Service</tos> and that you have read our <pp>Privacy Policy</pp>.',
  },
  requestToResetPassword: {
    id: 'users.requestToResetPassword',
    defaultMessage: 'Request to reset password',
  },
  forgotPasswordSubtitle: {
    id: 'users.forgotPasswordSubtitle',
    defaultMessage:
      'Recover access to your account by resetting your password.',
  },
  suddenlyRememberPassword: {
    id: 'users.suddenlyRememberPassword',
    defaultMessage: 'Suddenly remembered?',
  },
  signInAgain: {
    id: 'users.signInAgain',
    defaultMessage: 'Try signing in again',
  },
  resetPassword: {
    id: 'users.resetPassword',
    defaultMessage: 'Reset password',
  },
  resetPasswordSubtitle: {
    id: 'users.resetPasswordSubtitle',
    defaultMessage:
      'One more step: choose a new password for your account. Better remember it this time!',
  },
  resendConfirmationEmailSubtitle: {
    id: 'users.resendConfirmationEmailSubtitle',
    defaultMessage:
      "If you have created an account but haven't received a confirmation email, you can request a new one here.",
  },
  checkSpamBeforeRequestNewConfirmationEmail: {
    id: 'users.checkSpamBeforeRequestNewConfirmationEmail',
    defaultMessage:
      'You may want to check your spam folder for the email before requesting a new one.',
  },
  invalidEmailOrPassword: {
    id: 'users.invalidEmailOrPassword',
    defaultMessage:
      'Oops, invalid email or password. Check your email or password and try again.',
  },
  checkYourEmail: {
    id: 'users.checkYourEmail',
    defaultMessage: 'Almost there; check your email!',
  },
  signUpCheckYourEmailSubtitle: {
    id: 'users.signUpCheckYourEmailSubtitle',
    defaultMessage:
      "Your account has been created, but you'll need to confirm your email before you can use it. Follow the " +
      "instructions we've sent to <strong>{email}</strong> to proceed.",
  },
  confirmedYourEmail: {
    id: 'users.confirmedYourEmail',
    defaultMessage: 'Confirmed your email?',
  },
  didntReceiveConfirmationEmail: {
    id: 'users.didntReceiveConfirmationEmail',
    defaultMessage: "Didn't receive the email?",
  },
  passwordMinCharacters: {
    id: 'users.passwordMinCharacters',
    defaultMessage: 'Your password must be at least 8 characters long.',
  },
  passwordConfirmationRequired: {
    id: 'users.passwordConfirmationRequired',
    defaultMessage: 'Please confirm your password here.',
  },
  passwordConfirmationMustMatch: {
    id: 'users.passwordConfirmationMustMatch',
    defaultMessage:
      'Your password confirmation does not match your password above.',
  },
  errorRecaptcha: {
    id: 'users.errorRecaptcha',
    defaultMessage:
      'There was an error with the reCAPTCHA below, please try again.',
  },
  errorSigningUp: {
    id: 'users.errorSigningUp',
    defaultMessage: 'An error occurred while creating your account.',
  },
  errorRequestingResetPassword: {
    id: 'users.errorRequestingResetPassword',
    defaultMessage: 'An error occurred while requesting a password reset.',
  },
  forgotPasswordCheckYourEmailSubtitle: {
    id: 'users.forgotPasswordCheckYourEmailSubtitle',
    defaultMessage:
      "Follow the instructions we've sent to <strong>{email}</strong> to reset your password. " +
      'Until then, you can still use your old password if you still remember it.',
  },
  errorResendConfirmationEmail: {
    id: 'users.errorResendConfirmationEmail',
    defaultMessage:
      'An error occurred while requesting to resend confirmation email.',
  },
  resendConfirmationEmailCheckYourEmailSubtitle: {
    id: 'users.resendConfirmationEmailCheckYourEmailSubtitle',
    defaultMessage:
      "Follow the instructions we've sent to <strong>{email}</strong> to confirm your email. " +
      'Remember to check your spam folder before requesting another one.',
  },
  resendConfirmationEmailIfIssuePersistsContactUs: {
    id: 'users.resendConfirmationEmailIfIssuePersistsContactUs',
    defaultMessage:
      "If you still consistently don't receive the email, please <link>contact us at {supportEmail}</link>.",
  },
  resetPasswordLinkInvalidOrExpired: {
    id: 'users.resetPasswordTokenInvalidOrExpired',
    defaultMessage:
      "The password reset link you've used is either has expired or is invalid. Please use the correct one from " +
      'your email or request to reset again.',
  },
  errorResettingPassword: {
    id: 'users.errorResettingPassword',
    defaultMessage: 'An error occurred while resetting your password.',
  },
  passwordSuccessfullyReset: {
    id: 'users.passwordSuccessfullyReset',
    defaultMessage:
      'Your password was successfully reset. You may now sign in with your new password.',
  },
  confirmEmailLinkInvalidOrExpired: {
    id: 'users.confirmEmailLinkInvalidOrExpired',
    defaultMessage:
      "The email confirmation link you've used is either has expired or is invalid. Please use the correct one from " +
      'your email or request to resend another confirmation email.',
  },
  emailConfirmed: {
    id: 'users.emailConfirmed',
    defaultMessage: 'Email has been confirmed!',
  },
  emailConfirmedSubtitle: {
    id: 'users.emailConfirmedSubtitle',
    defaultMessage:
      'You can now sign in to your account with <strong>{email}</strong>.',
  },
  manageAllEmailsInAccountSettings: {
    id: 'users.manageAllEmailsInAccountSettings',
    defaultMessage:
      'Manage all your email addresses in <link>Account Settings</link>.',
  },
  completeSignUpToJoin: {
    id: 'users.completeSignUpToJoin',
    defaultMessage:
      'Almost there! Complete your sign up to join <strong>{course}</strong>.',
  },
  signUpWelcome: {
    id: 'users.signUpWelcome',
    defaultMessage: 'Welcome to {course}!',
  },
  signUpSuccessful: {
    id: 'users.signUpSuccessful',
    defaultMessage: 'Your account was successfully created.',
  },
  mustSignInToAccessPage: {
    id: 'users.mustSignInToAccessPage',
    defaultMessage: "You'll need to sign in to access this page.",
  },
  sessionExpiredSignInToContinue: {
    id: 'users.sessionExpiredSignInToContinue',
    defaultMessage:
      'Your session has expired. Please sign in again to continue.',
  },
});

export default translations;
