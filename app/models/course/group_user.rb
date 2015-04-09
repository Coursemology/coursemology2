class Course::GroupUser < ActiveRecord::Base
  stampable

  enum role: { normal: 0, manager: 1 }

  belongs_to :user, inverse_of: :course_group_users
  belongs_to :course_group, class_name: Course::Group.name, inverse_of: :group_users

  alias_method :group, :course_group
end
