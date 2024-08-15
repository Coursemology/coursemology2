# frozen_string_literal: true
class Course::Assessment::LiveFeedbackComment < ApplicationRecord
  belongs_to :code, class_name: 'Course::Assessment::LiveFeedbackCode', foreign_key: 'code_id', inverse_of: :comments

  validates :line_number, presence: true
  validates :comment, presence: true
end
