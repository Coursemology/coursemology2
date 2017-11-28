# frozen_string_literal: true
# Represents a generic announcement, which may be either a system-level or instance-level one.
#
# This is the abstract single-table inheritance table used for both announcement types.
class GenericAnnouncement < ApplicationRecord
  include AnnouncementConcern

  acts_as_readable on: :updated_at

  belongs_to :instance, inverse_of: :announcements, optional: true

  # @!method self.system_announcements_first
  #   Orders the results such that system announcements appear earlier in the result set.
  scope :system_announcements_first, -> { order(instance_id: :desc) }

  # @!method self.with_instance(instance)
  #   Returns the announcements which belong to the specified +instance+
  #   @param [Instance|Array<Instance>] instance The instance to retrieve announcements for.
  scope :with_instance, ->(instance) { where(instance: instance) }

  # @!method self.for_instance(instance)
  #   Returns the announcements for the specified +instance+. This would include both global and
  #     instance-level announcements.
  #   @param [Instance] instance The instance to retrieve announcements for.
  scope :for_instance, ->(instance) { with_instance([nil, instance]) }

  default_scope { system_announcements_first.order(start_at: :desc) }

  def sticky?
    false
  end
end
