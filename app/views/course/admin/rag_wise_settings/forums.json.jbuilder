# frozen_string_literal: true
json.forums @forums do |forum_hash|
  json.id forum_hash[:forum].id
  json.courseId forum_hash[:forum].course_id
  json.name forum_hash[:forum].name
  json.workflowState forum_hash[:workflow_state]
end
