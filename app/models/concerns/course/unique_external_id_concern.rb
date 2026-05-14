# frozen_string_literal: true
# This concern validates that external IDs are unique within a course,
# across both course users and pending invitations.
#
# Nil and blank external IDs are allowed.
module Course::UniqueExternalIdConcern
  extend ActiveSupport::Concern

  included do
    before_validation :normalize_external_id

    validate :validate_unique_external_id_within_course
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

    invitation_exists = Course::UserInvitation.
                        unconfirmed.
                        where(course_id: course_id, external_id: external_id).
                        where.not(id: id).
                        exists?

    course_user_exists = CourseUser.
                         where(course_id: course_id, external_id: external_id).
                         where.not(id: id).
                         exists?

    return unless invitation_exists || course_user_exists

    errors.add(:external_id, :taken)
  end
end
