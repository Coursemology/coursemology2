# frozen_string_literal: true
json.partial! 'assessment_list_data', assessment: @assessment, category: @category, tab: @tab, course: current_course

json.isAuthenticated false
json.isStartTimeBegin !assessment_not_started(@assessment_time)
json.startAt @assessment_time.start_at
