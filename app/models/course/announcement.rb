class Course::Announcement < ActiveRecord::Base
  stampable

  after_initialize :set_defaults, if: :new_record?

  belongs_to :creator, class_name: User.name
  belongs_to :course, inverse_of: :announcements

  scope :sorted_by_date, -> { order(valid_from: :desc) }

  # Set default values
  def set_defaults
    self.valid_from ||= Time.now
    self.valid_to ||= 7.days.from_now
  end

  # return [Bool] True if valid_from is a future time
  def valid_in_future?
    valid_from > DateTime.now
  end
end
