# frozen_string_literal: true
json.filter do
  return unless can_manage

  published_assessments = @category.assessments.ordered_by_date_and_title.published
  json.assessments published_assessments do |assessment|
    json.id assessment.id
    json.title assessment.title
  end

  groups = current_course.groups.ordered_by_name
  json.groups groups do |group|
    json.id group.id
    json.name group.name
  end

  students = current_course.course_users.order_alphabetically.student
  json.users students do |student|
    json.id student.user_id
    json.name student.name
  end
end
