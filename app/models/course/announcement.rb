class Course::Announcement < ActiveRecord::Base
  stampable

  belongs_to :creator, class_name: User.name
  belongs_to :course, inverse_of: :announcements
end
