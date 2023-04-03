# frozen_string_literal: true
class System::Announcement < GenericAnnouncement
  validates :instance, absence: true
end
