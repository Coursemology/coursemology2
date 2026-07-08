# frozen_string_literal: true
# This concern validates that external IDs are unique within a course,
# across both course users and pending invitations.
#
# Nil and blank external IDs are allowed.
module Course::UniqueExternalIdConcern
  extend ActiveSupport::Concern

  included do
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
    query.exists?
  end

  def external_id_taken_by_course_user?
    query = CourseUser.where(course_id: course_id, external_id: external_id)
    query = query.where.not(id: id) if is_a?(CourseUser)
    query.exists?
  end
end
