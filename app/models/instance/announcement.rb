class Instance::Announcement < ActiveRecord::Base
  stampable

  belongs_to :creator, class_name: User.name
  belongs_to :instance, inverse_of: :announcements

  def unread?
    # TODO: Implement
    false
  end
end
