# frozen_string_literal: true
class Instance::Announcement < GenericAnnouncement
  acts_as_tenant :instance, inverse_of: :announcements

  validates :instance, presence: true
  validates :title, length: { maximum: 255 }, presence: true
  validates :start_at, presence: true
  validates :end_at, presence: true
  validates :creator, presence: true
  validates :updater, presence: true

  scope :sorted_by_date, -> { order(start_at: :desc) }

  def to_partial_path
    'system/admin/instance/announcements/announcement'
  end
end
