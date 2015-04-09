class Course::Group < ActiveRecord::Base
  stampable

  belongs_to :course, inverse_of: :groups
  has_many :group_users, inverse_of: :course_group, dependent: :destroy,
                         class_name: Course::GroupUser.name, foreign_key: :course_group_id
  has_many :users, through: :group_users
end
