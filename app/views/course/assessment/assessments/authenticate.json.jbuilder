# frozen_string_literal: true

json.id @assessment.id
json.isAuthenticated false
json.isStartTimeBegin !assessment_not_started(@assessment.time_for(current_course_user))
json.startAt @assessment.time_for(current_course_user).start_at
