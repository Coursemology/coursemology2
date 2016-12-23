# frozen_string_literal: true
class Course::EnrolRequest < ActiveRecord::Base
  belongs_to :course, inverse_of: :enrol_requests
  belongs_to :user, inverse_of: :course_enrol_requests
end
