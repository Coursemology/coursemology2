# frozen_string_literal: true
class Course::Assessment::LiveFeedbackCode < ApplicationRecord
  self.table_name = 'course_assessment_live_feedback_code'
  belongs_to :feedback, class_name: 'Course::Assessment::LiveFeedback', foreign_key: 'feedback_id', inverse_of: :code
  has_many :comments, class_name: 'Course::Assessment::LiveFeedbackComment', foreign_key: 'code_id',
                      dependent: :destroy, inverse_of: :code

  validates :filename, presence: true
  validates :content, presence: true
end
