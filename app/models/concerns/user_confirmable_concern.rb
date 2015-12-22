module UserConfirmableConcern
  extend ActiveSupport::Concern

  module ReplacementInstanceMethods
    private

    # Overrides Devise::Models::Confirmable#confirmation_required?
    # This is for disabling the email confirmation logic in User model.
    # User::Email is supposed to handle all the confirmation stuffs.
    def confirmation_required?
      false
    end

    # Overrides Devise::Models::Confirmable#reconfirmation_required?
    # This is for disabling the email confirmation logic in User model.
    # User::Email is supposed to handle all the confirmation stuffs.
    def reconfirmation_required?
      false
    end

    # Overrides Devise::Models::Confirmable#postpone_email_change?
    # This is for disabling the email confirmation logic in User model.
    # User::Email is supposed to handle all the confirmation stuffs.
    def postpone_email_change?
      false
    end
  end

  included do
    devise :confirmable

    include ReplacementInstanceMethods
  end
end
