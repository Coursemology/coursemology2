# frozen_string_literal: true
json.stories @stories do |story|
  json.id story.id
  json.title story.title
  json.description story.description
  json.published story.published?

  json.startAt do
    json.partial! 'course/lesson_plan/items/personal_or_ref_time', locals: {
      item: @items_hash[story.id],
      course_user: current_course_user,
      attribute: :start_at,
      datetime_format: :short
    }
  end

  if current_course.gamified?
    json.baseExp story.base_exp
    json.timeBonusExp story.time_bonus_exp
  end
end

json.gamified current_course.gamified?
json.canManageStories can?(:manage, Course::Story.new(course: current_course))
