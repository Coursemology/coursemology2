# frozen_string_literal: true
class Course::Assessment::LiveFeedback::MessageFile < ApplicationRecord
  self.table_name = 'live_feedback_message_files'

  validates :message, presence: true
  validates :file, presence: true

  belongs_to :message, class_name: 'Course::Assessment::LiveFeedback::Message',
                       inverse_of: :message_files
  belongs_to :file, class_name: 'Course::Assessment::LiveFeedback::File',
                    inverse_of: :message_files
end
