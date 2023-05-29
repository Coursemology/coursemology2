import { defineMessages } from 'react-intl';

export default defineMessages({
  profile: {
    id: 'user.profile',
    defaultMessage: 'Your profile',
  },
  name: {
    id: 'user.name',
    defaultMessage: 'Name',
  },
  timeZone: {
    id: 'user.timeZone',
    defaultMessage: 'Time zone',
  },
  locale: {
    id: 'user.locale',
    defaultMessage: 'Language',
  },
  profilePicture: {
    id: 'user.profilePicture',
    defaultMessage: 'Profile picture',
  },
  changeProfilePicture: {
    id: 'user.changeProfilePicture',
    defaultMessage: 'Change',
  },
  emails: {
    id: 'user.emails',
    defaultMessage: 'Emails',
  },
  primaryEmail: {
    id: 'user.primaryEmail',
    defaultMessage: 'Primary',
  },
  confirmedEmail: {
    id: 'user.confirmedEmail',
    defaultMessage: 'Confirmed',
  },
  unconfirmedEmail: {
    id: 'user.unconfirmedEmail',
    defaultMessage: 'Unconfirmed',
  },
  setEmailAsPrimary: {
    id: 'user.setEmailAsPrimary',
    defaultMessage: 'Set as primary',
  },
  resendConfirmationEmail: {
    id: 'user.resendConfirmationEmail',
    defaultMessage: 'Resend confirmation email',
  },
  addAnotherEmail: {
    id: 'user.addAnotherEmail',
    defaultMessage: 'Add another email address',
  },
  emailAddress: {
    id: 'user.emailAddress',
    defaultMessage: 'Email address',
  },
  emailAddressPlaceholder: {
    id: 'user.emailAddressPlaceholder',
    defaultMessage: 'e.g., john.doe@company.com',
  },
  addEmailAddress: {
    id: 'user.addEmailAddress',
    defaultMessage: 'Add email address',
  },
  changePassword: {
    id: 'user.changePassword',
    defaultMessage: 'Change password',
  },
  currentPassword: {
    id: 'user.currentPassword',
    defaultMessage: 'Current password',
  },
  newPassword: {
    id: 'user.newPassword',
    defaultMessage: 'New password',
  },
  newPasswordConfirmation: {
    id: 'user.newPasswordConfirmation',
    defaultMessage: 'Confirm new password',
  },
  newPasswordRequirementHint: {
    id: 'user.newPasswordRequirementHint',
    defaultMessage:
      'Make sure your new password is at least 8 characters long.',
  },
  nameRequired: {
    id: 'user.nameRequired',
    defaultMessage: 'You do have a name, right?',
  },
  timeZoneRequired: {
    id: 'user.timeZoneRequired',
    defaultMessage: 'Please select at least one time zone.',
  },
  localeRequired: {
    id: 'user.localeRequired',
    defaultMessage: 'Please select at least one language.',
  },
  currentPasswordRequired: {
    id: 'user.currentPasswordRequired',
    defaultMessage:
      'If you are changing your password, please enter your current password here.',
  },
  newPasswordRequired: {
    id: 'user.newPasswordRequired',
    defaultMessage:
      'If you are changing your password, please enter the new password here.',
  },
  newPasswordMinCharacters: {
    id: 'user.newPasswordMinCharacters',
    defaultMessage: 'Your new password must be at least 8 characters long.',
  },
  newPasswordConfirmationRequired: {
    id: 'user.newPasswordConfirmationRequired',
    defaultMessage: 'Please confirm your password here.',
  },
  newPasswordConfirmationMustMatch: {
    id: 'user.newPasswordConfirmationMustMatch',
    defaultMessage:
      'Your password confirmation does not match your password above.',
  },
  uploadingProfilePicture: {
    id: 'user.uploadingProfilePicture',
    defaultMessage: 'Uploading your profile picture...',
  },
  profilePictureUpdated: {
    id: 'user.profilePictureUpdated',
    defaultMessage: 'Your profile picture was successfully updated.',
  },
  emailAdded: {
    id: 'user.emailAdded',
    defaultMessage:
      '{email} was successfully added. A confirmation email is on the way.',
  },
  errorAddingEmail: {
    id: 'user.errorAddingEmail',
    defaultMessage: 'An error occurred while adding {email}.',
  },
  emailRemoved: {
    id: 'user.emailRemoved',
    defaultMessage: '{email} was successfully removed.',
  },
  errorRemovingEmail: {
    id: 'user.errorRemovingEmail',
    defaultMessage: 'An error occurred while removing {email}.',
  },
  emailSetAsPrimary: {
    id: 'user.emailSetAsPrimary',
    defaultMessage: '{email} was successfully set as your primary email.',
  },
  errorSettingPrimaryEmail: {
    id: 'user.errorSettingPrimaryEmail',
    defaultMessage:
      'An error occurred while setting {email} as the primary email.',
  },
  confirmationEmailSent: {
    id: 'user.confirmationEmailSent',
    defaultMessage: 'A confirmation email has been sent to {email}.',
  },
  errorSendingConfirmationEmail: {
    id: 'user.errorSendingConfirmationEmail',
    defaultMessage:
      'An error occurred while sending a confirmation email to {email}.',
  },
  removeEmail: {
    id: 'user.removeEmail',
    defaultMessage: 'Remove email',
  },
  removeEmailPromptTitle: {
    id: 'user.removeEmailPromptTitle',
    defaultMessage: "Sure you're removing {email}?",
  },
  removeEmailPromptMessage: {
    id: 'user.removeEmailPromptMessage',
    defaultMessage:
      'If you remove {email}, you must confirm it again before you can use it.',
  },
  emailCanLogIn: {
    id: 'user.emailCanLogIn',
    defaultMessage: 'Can be used to log in',
  },
  emailReceivesNotifications: {
    id: 'user.emailReceivesNotifications',
    defaultMessage: 'Receives notifications',
  },
  emailMustConfirm: {
    id: 'user.emailMustConfirm',
    defaultMessage: 'You must confirm this email before you can use it.',
  },
  accountSettings: {
    id: 'user.accountSettings',
    defaultMessage: 'Account Settings',
  },
});
