# frozen_string_literal: true
module Course::CourseUserTypeConcern
  extend ActiveSupport::Concern

  COURSE_USER_TYPES = {
    my_students: 'my_students',
    my_students_w_phantom: 'my_students_w_phantom',
    students: 'students',
    students_w_phantom: 'students_w_phantom',
    staff: 'staff',
    staff_w_phantom: 'staff_w_phantom'
  }.freeze

  module ClassMethods
    def valid_course_user_type?(type)
      COURSE_USER_TYPES.value?(type)
    end
  end

  # rubocop:disable Metrics/CyclomaticComplexity
  def course_users_by_type(type, user)
    case type
    when COURSE_USER_TYPES[:my_students]
      user&.my_students&.without_phantom_users || CourseUser.none
    when COURSE_USER_TYPES[:my_students_w_phantom]
      user&.my_students || CourseUser.none
    when COURSE_USER_TYPES[:students_w_phantom]
      students
    when COURSE_USER_TYPES[:staff]
      staff.without_phantom_users
    when COURSE_USER_TYPES[:staff_w_phantom]
      staff
    else
      students.without_phantom_users # :students is the default type
    end
  end
  # rubocop:enable Metrics/CyclomaticComplexity
end
