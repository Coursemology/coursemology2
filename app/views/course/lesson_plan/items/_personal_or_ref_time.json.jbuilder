# frozen_string_literal: true

effective_time = item.time_for(course_user)
reference_time = item.reference_time_for(course_user)

json.isFixed effective_time.is_a? Course::PersonalTime and effective_time.fixed?

if effective_time[attribute]
  json.effectiveTime effective_time[attribute]
else
  json.effectiveTime nil
end

if reference_time[attribute]
  json.referenceTime reference_time[attribute]
else
  json.referenceTime nil
end
