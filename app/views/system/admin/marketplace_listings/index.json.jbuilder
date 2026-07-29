# frozen_string_literal: true
json.listings @listings do |listing|
  json.id listing.id
  json.title listing.current_version&.assessment&.title
  json.currentVersionPublishedAt listing.current_version&.published_at
  json.lastPublishedAt listing.last_published_at
  json.adoptions(@adoption_counts[listing.id] || 0)
  json.sourceCourseId listing.source_course_id
  json.sourceCourseName listing.source_course_name
  # Two instances can each have a course called "CS1010", and a course id only resolves on its own
  # instance's host — hence both the name (to tell them apart) and the host (to link at all).
  json.sourceInstanceName listing.source_instance&.name
  json.sourceInstanceHost listing.source_instance&.host
  json.sourceStartedAt listing.source_started_at
  json.sourceEndedAt listing.source_ended_at
  json.state listing.admin_state
  # Orthogonal to `state`: WHERE the authoring copy lives, not whether the listing is on the
  # marketplace. The provenance fields above keep naming the origin course even after a rebuild.
  json.marketplaceHosted listing.marketplace_hosted?
  # Deletion facts, separate from `state`/visibility: a rebuilt listing can be published AND have a
  # deleted origin at the same time.
  json.sourceAssessmentDeleted listing.source_assessment_deleted?
  json.sourceCourseDeleted listing.source_course_deleted?
  json.authoringAssessmentUrl @authoring_urls[listing.id]
end
