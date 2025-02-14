# frozen_string_literal: true
class Course::Assessment::LiveFeedback::File < ApplicationRecord
  self.table_name = 'live_feedback_files'

  has_many :message_files, class_name: 'Course::Assessment::LiveFeedback::MessageFile',
                           foreign_key: 'file_id', inverse_of: :file, dependent: :destroy

  validates :filename, presence: true
  validates :content, exclusion: { in: [nil] }
end
