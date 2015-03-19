class Course::Announcement < ActiveRecord::Base
  stampable
  acts_as_readable on: :updated_at

  after_initialize :set_defaults, if: :new_record?
  after_create { |announcement| announcement.mark_as_read! for: announcement.creator }
  after_update { |announcement| announcement.mark_as_read! for: announcement.updater }

  belongs_to :creator, class_name: User.name
  belongs_to :course, inverse_of: :announcements

  scope :sorted_by_date, -> { order(valid_from: :desc) }
  scope :sorted_by_sticky, -> { order(sticky: :desc) }

  # Set default values
  def set_defaults
    self.valid_from ||= Time.now
    self.valid_to ||= 7.days.from_now
  end
end
