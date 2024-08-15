class Course::Assessment::LiveFeedbackCode < ApplicationRecord
  self.table_name = 'course_assessment_live_feedback_code'

  belongs_to :assessment, class_name: 'Course::Assessment', foreign_key: 'assessment_id'
  belongs_to :question, class_name: 'Course::Assessment::Question', foreign_key: 'question_id'
  belongs_to :creator, class_name: 'CourseUser', foreign_key: 'created_by'
  has_many :comments, class_name: 'Course::Assessment::LiveFeedbackComment', foreign_key: 'code_id',
                      dependent: :destroy

  validates :feedback_id, presence: true
  validates :content, presence: true
end
