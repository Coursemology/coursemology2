# frozen_string_literal: true
# Represents a generic announcement, which may be either a system-level or instance-level one.
#
# This is the abstract single-table inheritance table used for both announcement types.
class GenericAnnouncement < ApplicationRecord
  after_initialize :set_defaults, if: :new_record?
  acts_as_readable on: :updated_at
  after_create :mark_as_read_by_creator
  after_update :mark_as_read_by_updater

  belongs_to :instance, inverse_of: :announcements

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

  private

  # Set default values
  def set_defaults
    self.start_at ||= Time.zone.now
    self.end_at ||= 7.days.from_now
  end

  # Mark announcement as read for the creator
  def mark_as_read_by_creator
    mark_as_read! for: creator
  end

  # Mark announcement as read for the updater
  def mark_as_read_by_updater
    mark_as_read! for: updater
  end
end
