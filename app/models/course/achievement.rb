class Course::Achievement < ActiveRecord::Base
  stampable

  belongs_to :creator, class_name: User.name
  belongs_to :course, inverse_of: :achievements

  default_scope { order(weight: :asc) }

  has_attached_file :icon, styles: { medium: "300x300>", thumb: "100x100>" },
                    default_url: '/images/achievement_icon.png'
  validates_attachment_content_type :avatar, content_type: /\Aimage\/.*\Z/
end
