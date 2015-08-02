class Course::Announcement < ActiveRecord::Base
  acts_as_readable on: :updated_at

  after_initialize :set_defaults, if: :new_record?
  after_create { |announcement| announcement.mark_as_read! for: announcement.creator }
  after_update { |announcement| announcement.mark_as_read! for: announcement.updater }

  belongs_to :course, inverse_of: :announcements

  scope :sorted_by_date, -> { order(start_at: :desc) }
  scope :sorted_by_sticky, -> { order(sticky: :desc) }

  # Set default values
  def set_defaults
    self.start_at ||= Time.zone.now
    self.end_at ||= 7.days.from_now
  end
end
