# frozen_string_literal: true
class Course::Assessment::LiveFeedback::Option < ApplicationRecord
  self.table_name = 'live_feedback_options'

  has_many :message_options, class_name: 'Course::Assessment::LiveFeedback::MessageOption',
                             inverse_of: :option, dependent: :destroy

  enum :option_type, { suggestion: 0, fix: 1 }
  validates :option_type, presence: true
  validates :is_enabled, inclusion: { in: [true, false] }
end
