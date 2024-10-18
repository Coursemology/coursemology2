# frozen_string_literal: true
class Course::UserEmailUnsubscription < ApplicationRecord
  validates :course_user, presence: true
  acts_as_paranoid

  belongs_to :course_user, inverse_of: :email_unsubscriptions
  belongs_to :course_setting_email, class_name: 'Course::Settings::Email',
                                    foreign_key: :course_settings_email_id,
                                    inverse_of: :email_unsubscriptions
end
