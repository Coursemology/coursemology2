# frozen_string_literal: true
# This concern validates that external IDs are unique within a course,
# across both course users and pending invitations.
#
# Nil and blank external IDs are allowed.
module Course::UniqueExternalIdConcern
  extend ActiveSupport::Concern

  included do
    # The invitation this record is being created from, if any. A record inheriting its external ID
    # from the invitation that created it is not a conflict, so that invitation is excluded from the
    # uniqueness check. Callers that set this must confirm or destroy the invitation in the same
    # transaction, otherwise the two records are left sharing an external ID.
    attr_accessor :source_invitation

    before_validation :normalize_external_id

    validate :validate_unique_external_id_within_course, if: -> { new_record? || external_id_changed? }
  end

  private

  # Normalizes blank external IDs to nil.
  #
  # @return [void]
  def normalize_external_id
    self.external_id = nil if external_id.blank?
  end

  # Validates that the external ID is unique within the course,
  # across both course users and invitations.
  #
  # @return [void]
  def validate_unique_external_id_within_course
    return if external_id.blank?
    return unless external_id_taken_by_invitation? || external_id_taken_by_course_user?

    errors.add(:external_id, :taken)
  end

  def external_id_taken_by_invitation?
    query = Course::UserInvitation.unconfirmed.where(course_id: course_id, external_id: external_id)
    query = query.where.not(id: id) if is_a?(Course::UserInvitation)
    query = query.where.not(id: source_invitation.id) if source_invitation&.persisted?
    query.exists?
  end

  def external_id_taken_by_course_user?
    query = CourseUser.where(course_id: course_id, external_id: external_id)
    query = query.where.not(id: id) if is_a?(CourseUser)
    query.exists?
  end
end
