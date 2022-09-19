# frozen_string_literal: true
json.title @settings.title || ''

json.canCreateTabs can?(:create, Course::Video::Tab.new(course: current_course))

json.tabs do
  json.array! current_course.video_tabs do |tab|
    json.id tab.id
    json.title tab.title
    json.weight tab.weight

    json.canDeleteTab can?(:destroy, tab)
  end
end
