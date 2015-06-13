# Represents a generic announcement, which may be either a system-level or instance-level one.
class GenericAnnouncement
  include ActiveModel::Model

  # @return [Array<SystemAnnouncement|Instance::Announcement>]
  def self.currently_valid
    system = SystemAnnouncement.includes(:creator).currently_valid.order(valid_from: :desc)
    instance = Instance::Announcement.includes(:creator).currently_valid.order(valid_from: :desc)
    system + instance
  end
end
