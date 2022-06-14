# frozen_string_literal: true
json.enrolRequests @enrol_requests.each do |enrol_request|
  json.partial! 'enrol_request', enrol_request: enrol_request
end

json.permissions do
  json.partial! 'course/users/permissions_data', current_course: current_course
end

json.manageCourseUsersData do
  json.partial! 'course/users/tabs_data', current_course: current_course
  json.defaultTimelineAlgorithm current_course.default_timeline_algorithm
end
