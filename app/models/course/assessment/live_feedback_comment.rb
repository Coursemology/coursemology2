# app/models/course/assessment/live_feedback_comment.rb
class Course::Assessment::LiveFeedbackComment < ApplicationRecord
  belongs_to :code, class_name: 'Course::Assessment::LiveFeedbackCode', foreign_key: 'code_id'

  validates :line_number, presence: true
  validates :comment, presence: true
end
