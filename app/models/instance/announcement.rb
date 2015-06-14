class Instance::Announcement < GenericAnnouncement
  acts_as_tenant :instance

  validates :instance, presence: true
end
