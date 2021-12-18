# frozen_string_literal: true
class Course::UserEmailUnsubscription < ApplicationRecord
  validates :course_user, presence: true

  belongs_to :course_user, inverse_of: :email_unsubscriptions
  belongs_to :course_setting_email, class_name: Course::Settings::Email.name,
                                    foreign_key: :course_settings_email_id,
                                    inverse_of: :email_unsubscriptions
end
