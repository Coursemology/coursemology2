class SystemAnnouncement < ActiveRecord::Base
  stampable
  belongs_to :creator, class_name: User.name
end
