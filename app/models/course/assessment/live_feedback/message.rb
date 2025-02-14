# frozen_string_literal: true
class Course::Assessment::LiveFeedback::Message < ApplicationRecord
  self.table_name = 'live_feedback_messages'

  belongs_to :thread, class_name: 'Course::Assessment::LiveFeedback::Thread',
                      foreign_key: 'thread_id', inverse_of: :messages

  has_many :message_files, class_name: 'Course::Assessment::LiveFeedback::MessageFile',
                           foreign_key: 'message_id', inverse_of: :message, dependent: :destroy
  has_many :message_options, class_name: 'Course::Assessment::LiveFeedback::MessageOption',
                             foreign_key: 'message_id', inverse_of: :message, dependent: :destroy

  validates :is_error, inclusion: { in: [true, false] }
  validates :content, exclusion: { in: [nil] }
  validates :creator_id, presence: true
  validates :created_at, presence: true
end
