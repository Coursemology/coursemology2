json.courseUsers @course_users do |course_user|
  json.id course_user.id
  json.name course_user.name
  json.role course_user.role
  json.isPhantom course_user.phantom?
end
