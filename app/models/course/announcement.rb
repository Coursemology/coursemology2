class Course::Announcement < ActiveRecord::Base
  stampable

  after_initialize :set_defaults, if: :new_record?

  belongs_to :creator, class_name: User.name
  belongs_to :course, inverse_of: :announcements

  # Set default values
  def set_defaults
    self.valid_from ||= Time.now
    self.valid_to ||= 7.days.from_now
  end
end
