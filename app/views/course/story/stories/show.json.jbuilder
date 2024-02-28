# frozen_string_literal: true
json.story do
  json.id @story.id
  json.title @story.title
  json.description @story.description
  json.published @story.published?
  json.startAt @story.start_at&.iso8601
  json.endAt @story.end_at&.iso8601
  json.providerId @story.provider_id

  if current_course.gamified?
    json.bonusEndAt @story.bonus_end_at&.iso8601
    json.baseExp @story.base_exp
    json.timeBonusExp @story.time_bonus_exp
  end

  if current_course.show_personalized_timeline_features?
    json.hasPersonalTimes @story.has_personal_times
    json.affectsPersonalTimes @story.affects_personal_times
  end
end

json.gamified current_course.gamified?
json.showPersonalizedTimelineFeatures current_course.show_personalized_timeline_features?
json.hasRooms @has_rooms

# json.partial! 'course/condition/condition_data.json', conditional: @story
