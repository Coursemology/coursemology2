# frozen_string_literal: true
class Course::Scholaistic::CourseUser < ApplicationRecord
  validates :upstream_id, presence: true
  validates :course_user, presence: true

  belongs_to :course_user, inverse_of: :scholaistic_course_user
end
