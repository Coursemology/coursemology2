json.currentHost current_tenant.host

json.targetCourses @target_courses do |course|
  json.(course, :id, :title)
  json.path course_path(course)
  json.host course.instance.host
end

json.assessmentsComponent @categories do |category|
  json.(category, :id, :title)
  json.tabs category.tabs do |tab|
    json.(tab, :id, :title)
    json.assessments tab.assessments do |assessment|
      json.(assessment, :id, :title, :published)
    end
  end
end

json.surveyComponent @surveys do |survey|
  json.(survey, :id, :title, :published)
end
