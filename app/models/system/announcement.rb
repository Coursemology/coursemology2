# frozen_string_literal: true
class System::Announcement < GenericAnnouncement
  validates :instance, absence: true

  # @!method self.ordered_by_date(direction = :desc)
  #   Orders the announcements by date, defaults to descending order.
  #   @param [Symbol] direction The direction to order results by.
  scope :ordered_by_date, ->(direction = :desc) { order(start_at: direction) }

  def to_partial_path
    'system/admin/announcements/announcement'
  end
end
