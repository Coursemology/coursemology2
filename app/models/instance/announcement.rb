# frozen_string_literal: true
class Instance::Announcement < GenericAnnouncement
  acts_as_tenant :instance, inverse_of: :announcements

  validates :instance, presence: true
  validates_length_of :title, allow_nil: true, maximum: 255
  validates_presence_of :title
  validates_presence_of :start_at
  validates_presence_of :end_at
  validates_presence_of :creator
  validates_presence_of :updater

  def to_partial_path
    'system/admin/instance/announcements/announcement'
  end
end
