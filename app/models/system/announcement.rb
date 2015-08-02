class System::Announcement < GenericAnnouncement
  validates :instance, absence: true

  def to_partial_path
    'system/admin/announcements/announcement'.freeze
  end
end
