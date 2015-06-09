# Represents a generic announcement, which may be either a system-level or instance-level one.
class GenericAnnouncement
  include ActiveModel::Model

  # @return [Array<SystemAnnouncement|Instance::Announcement>]
  def self.currently_valid
    in_time_range = ['valid_from <= :now AND :now <= valid_to', {now: Time.zone.now}]
    system = SystemAnnouncement.includes(:creator).where(in_time_range).order(valid_from: :desc)
    instance = Instance::Announcement.includes(:creator).where(in_time_range).order(valid_from: :desc)
    system + instance
  end
end
