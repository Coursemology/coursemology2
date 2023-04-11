# frozen_string_literal: true

json.id @assessment.id
json.isAuthenticated false
json.isStartTimeBegin !assessment_not_started(@assessment_time)
json.startAt @assessment_time.start_at
