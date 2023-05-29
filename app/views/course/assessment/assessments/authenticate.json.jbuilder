# frozen_string_literal: true

json.id @assessment.id
json.title @assessment.title
json.tabTitle "#{@category.title}: #{@tab.title}"
json.tabUrl course_assessments_path(course_id: current_course, category: @category, tab: @tab)
json.isAuthenticated false
json.isStartTimeBegin !assessment_not_started(@assessment_time)
json.startAt @assessment_time.start_at
