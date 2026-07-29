# frozen_string_literal: true
class Course::Assessment::Marketplace::Adoption < ApplicationRecord
  belongs_to :listing, class_name: 'Course::Assessment::Marketplace::Listing', inverse_of: :adoptions
  belongs_to :destination_course, class_name: 'Course', inverse_of: false
  belongs_to :duplicated_assessment, class_name: 'Course::Assessment', inverse_of: false

  validates :duplicated_assessment_id, uniqueness: true
  validates :creator, presence: true
  validates :updater, presence: true

  # Resolves the "a newer version is available" notice for an adopted assessment (design §6.1).
  #
  # Deliberately a pure timestamp comparison over adoptions / listings / listing_versions — the
  # container snapshot is never loaded, so this stays cheap enough to run on every assessment show.
  # `duplicated_assessment_id` carries a unique index, so the lookup is a single indexed hit.
  #
  # @param [Integer] assessment_id the adopter's own copy
  # @return [Hash, nil]
  def self.update_notice_for(assessment_id)
    adoption = includes(listing: :current_version).find_by(duplicated_assessment_id: assessment_id)
    return nil unless adoption&.update_pending?

    counts = adoption.duplicated_assessment.submission_counts_by_author

    { adopted_version_at: adoption.adopted_version_at,
      latest_version_at: adoption.latest_version_at,
      # Advisory only: the endpoint re-checks this before it destroys anything. When false the
      # banner has no action to offer — it explains why instead.
      can_update_in_place: counts[:student] == 0,
      # Staff and phantom test runs do not block the update, but they are deleted by it.
      test_submission_count: counts[:other] }
  end

  # @return [ActiveSupport::TimeWithZone, nil] when the content the listing currently serves was
  #   published
  def latest_version_at
    listing.current_version&.published_at
  end

  # Whether this adopter should be told about a newer version.
  #
  # There is deliberately no way to silence this: the notice is a statement of fact about the copy,
  # not a notification, so it stands for as long as the copy is behind. It stops on its own once the
  # copy is updated (which restamps `adopted_version_at`) or the copy is deleted.
  #
  # Fails toward SILENCE: an unknown `adopted_version_at` or a version-less listing yields false. A
  # false "an update is waiting" trains managers to ignore the banner and destroys the signal for
  # the case that matters.
  #
  # @return [Boolean]
  def update_pending?
    return false if adopted_version_at.nil? || latest_version_at.nil?

    latest_version_at > adopted_version_at
  end
end
