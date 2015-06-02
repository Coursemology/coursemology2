class Course::Group < ActiveRecord::Base
  stampable

  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  belongs_to :course, inverse_of: :groups
  has_many :group_users, inverse_of: :course_group, dependent: :destroy,
                         class_name: Course::GroupUser.name, foreign_key: :course_group_id
  has_many :users, through: :group_users

  private

  # Set default values
  def set_defaults
    return if !course || !creator
    return if !course.course_users.exists?(user: creator) || group_users.exists?(user: creator)
    group_users.build(user: creator, role: :manager, creator: creator, updater: updater)
  end
end
