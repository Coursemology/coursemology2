# frozen_string_literal: true
class Course::UserInvitation < ActiveRecord::Base
  after_initialize :generate_invitation_key, if: :new_record?

  belongs_to :course_user, dependent: :destroy, inverse_of: :invitation
  belongs_to :user_email, class_name: User::Email.name, validate: true, inverse_of: false

  private

  # Generates the invitation key. All invitation keys generated start with I so we can
  # distinguish it from other kinds of keys in future.
  #
  # @return [void]
  def generate_invitation_key
    self.invitation_key ||= 'I'.freeze + SecureRandom.base64(8)
  end
end
