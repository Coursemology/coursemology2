# frozen_string_literal: true

# Info for rendering the tabs
json.tabs do
  if can_manage
    json.myStudentsPendingCount my_students_pending_submissions_count
    json.allStudentsPendingCount pending_submissions_count
  end

  json.categories current_course.assessment_categories do |category|
    json.id category.id
    json.title category.title
  end
end
