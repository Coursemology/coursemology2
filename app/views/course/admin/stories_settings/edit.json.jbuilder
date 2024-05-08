# frozen_string_literal: true
json.ignore_nil!

json.title @settings.title || ''
json.pushKey @settings.push_key || ''

json.pingResult do
  json.status @ping_status
  json.remoteCourseName @remote_course_name
  json.remoteCourseUrl @remote_course_url
end
