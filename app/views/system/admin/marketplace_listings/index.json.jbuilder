# frozen_string_literal: true
json.listings @listings do |listing|
  json.id listing.id
  json.title listing.current_version&.assessment&.title
  json.currentVersionPublishedAt listing.current_version&.published_at
  json.lastPublishedAt listing.last_published_at
  json.adoptions(@adoption_counts[listing.id] || 0)
  json.sourceCourseId listing.source_course_id
  json.sourceCourseName listing.source_course_name
  json.sourceInstanceName listing.source_instance&.name
  json.sourceInstanceHost listing.source_instance&.host
  json.state listing.admin_state
  # Orthogonal to `state`: WHERE the authoring copy lives, not whether the listing is on the
  # marketplace.
  json.marketplaceHosted listing.marketplace_hosted?
  # Deletion facts, separate from `state`/visibility: a rebuilt listing can be published AND have a
  # deleted origin at the same time.
  json.sourceAssessmentDeleted listing.source_assessment_deleted?
  json.sourceCourseDeleted listing.source_course_deleted?
  json.authoringAssessmentUrl @authoring_urls[listing.id]
end
