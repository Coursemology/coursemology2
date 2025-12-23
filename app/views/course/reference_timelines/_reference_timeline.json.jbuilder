# frozen_string_literal: true
json.id timeline.id
json.title timeline.title
json.timesCount timeline.reference_times.size

json.weight timeline.weight if timeline.weight.present?
json.default true if timeline.default?
json.assignees timeline.course_users.size unless timeline.default?
