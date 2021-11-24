# frozen_string_literal: true
# These are the common fields to be displayed for all lesson plan items
json.id item.acting_as.id
json.(item, :title, :published)

time_for_current_user = item.time_for(current_course_user)
json.start_at time_for_current_user.start_at&.iso8601
json.bonus_end_at time_for_current_user.bonus_end_at&.iso8601
json.end_at time_for_current_user.end_at&.iso8601
