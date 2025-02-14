# frozen_string_literal: true
class Course::Assessment::LiveFeedback::MessageOption < ApplicationRecord
  self.table_name = 'live_feedback_message_options'

  validates :message, presence: true
  validates :option, presence: true

  belongs_to :message, class_name: 'Course::Assessment::LiveFeedback::Message',
                       inverse_of: :message_options
  belongs_to :option, class_name: 'Course::Assessment::LiveFeedback::Option',
                      inverse_of: :message_options
end
