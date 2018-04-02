# frozen_string_literal: true
json.currentHost current_tenant.host

json.currentCourse do
  json.(current_course, :title, :start_at)
end

json.targetCourses @target_courses do |course|
  json.(course, :id, :title)
  json.path course_path(course)
  json.host course.instance.host
  json.rootFolder do
    root_folder = @root_folder_map[course.id]
    json.subfolders root_folder.children.map(&:name)
    json.materials root_folder.materials.map(&:name)
  end
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

json.achievementsComponent @achievements do |achievement|
  json.(achievement, :id, :title, :published)
  json.url achievement_badge_path(achievement)
end

json.materialsComponent @folders do |folder|
  json.(folder, :id, :name, :parent_id)
  json.materials folder.materials do |material|
    json.(material, :id, :name)
  end
end

json.videosComponent @video_tabs do |tab|
  json.(tab, :id, :title)
  json.videos tab.videos do |video|
    json.(video, :id, :title, :published)
  end
end
