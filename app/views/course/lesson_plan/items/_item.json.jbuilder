# frozen_string_literal: true
# These are the common fields to be displayed for all lesson plan items
json.id item.acting_as.id
json.(item, :title, :published)
json.(item.time_for(current_course_user), :start_at, :bonus_end_at, :end_at)
