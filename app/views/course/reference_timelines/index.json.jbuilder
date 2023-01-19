# frozen_string_literal: true
json.gamified current_course.gamified
json.defaultTimeline current_course.default_reference_timeline.id

json.timelines @timelines do |timeline|
  json.partial! 'reference_timeline', timeline: timeline
end

json.items @items do |item|
  json.id item.id
  json.title item.title
  json.times do
    item.reference_times.each do |time|
      json.set! time.reference_timeline_id, {
        id: time.id,
        startAt: time.start_at,
        bonusEndAt: time.bonus_end_at,
        endAt: time.end_at
      }.compact
    end
  end
end
