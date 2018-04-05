# frozen_string_literal: true
class Instance::Announcement < GenericAnnouncement
  acts_as_tenant :instance, inverse_of: :announcements

  validates :instance, presence: true

  def to_partial_path
    'system/admin/instance/announcements/announcement'
  end
end
