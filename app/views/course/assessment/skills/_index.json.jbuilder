json.skills current_course.assessment_skills.order_by_title do |skill|
  json.(skill, :id, :title)
end
