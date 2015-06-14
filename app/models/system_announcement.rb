class SystemAnnouncement < GenericAnnouncement
  validates :instance, absence: true
end
