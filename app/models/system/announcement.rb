class System::Announcement < GenericAnnouncement
  validates :instance, absence: true
end
