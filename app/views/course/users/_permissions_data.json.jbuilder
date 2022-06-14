# frozen_string_literal: true
json.canManageCourseUsers can?(:manage, CourseUser.new(course: current_course))
json.canManageEnrolRequests can?(:manage, Course::EnrolRequest.new(course: current_course))
json.canManagePersonalTimes current_course.show_personalized_timeline_features? &&
                            can?(:manage_personal_times, current_course)
json.canRegisterWithCode current_course.code_registration_enabled?
