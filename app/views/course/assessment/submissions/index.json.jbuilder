# frozen_string_literal: true

# Permission for displaying pending submissions tabs & filter
can_manage = current_course_user&.staff? || can?(:manage, current_course)

is_gamified = current_course.gamified?
json.isGamified is_gamified

json.submissionCount @submission_count

json.submissions @submissions do |submission|
  json.partial! 'submissions_list_data',
                submission: submission,
                assessments_hash: @assessments_hash,
                pending: false,
                is_gamified: is_gamified
end

# Info for rendering the tabs
json.partial! 'tabs', can_manage: can_manage

# Filter info passed only if canManage
json.partial! 'filter', can_manage: can_manage

json.permissions do
  json.canManage can_manage
  json.isTeachingStaff current_course_user&.teaching_staff? || can?(:manage, current_course)
end
