# frozen_string_literal: true
# required for scribing questions

json.skills current_course.assessment_skills.order_by_title do |skill|
  json.(skill, :id, :title)
end
