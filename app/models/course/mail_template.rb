class Course::MailTemplate < ActiveRecord::Base
  stampable
  belongs_to :course
  has_one :mail_sign_off, through: :course

  # Returns the content of customized sign off if it exists
  def sign_off
    if mail_sign_off
      mail_sign_off.content
    end
  end

  # Given a course, the mailer action and the part, returns the content of the part of the mail
  # template.
  # @param [Course] The course.
  # @param [string, symbol] The mailer action.
  # @param [string, symbol] The part of the template. Can only be 'subject', 'pre_message',
  # 'post_message' or 'sign_off'.
  # @returns [string] The content of the requested template part if exist or nil otherwise.
  def self.template_content(course, action, part)
    if template = Course::MailTemplate.find_by_course_id_and_action(course.id, action.to_s)
      template.send(part) if template.respond_to?(part)
    end
  end
end
