class Course::MailSignOff < ActiveRecord::Base
  stampable
  belongs_to :course, inverse_of: :mail_sign_off
end
