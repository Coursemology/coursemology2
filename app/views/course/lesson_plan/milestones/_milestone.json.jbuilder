# frozen_string_literal: true
json.(milestone, :id, :title, :description)
json.start_at milestone.time_for(current_course_user).start_at&.iso8601
