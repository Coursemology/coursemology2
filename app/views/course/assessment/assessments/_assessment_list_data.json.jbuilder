# frozen_string_literal: true
json.id assessment.id
json.title assessment.title
json.tabTitle "#{category.title}: #{tab.title}"
json.tabUrl course_assessments_path(course_id: course, category: category, tab: tab)
