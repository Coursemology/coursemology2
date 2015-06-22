class Course::Group < ActiveRecord::Base
  stampable

  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?
  before_save :remove_duplicate_users

  belongs_to :course, inverse_of: :groups
  has_many :group_users, inverse_of: :course_group, dependent: :destroy,
                         class_name: Course::GroupUser.name, foreign_key: :course_group_id
  has_many :users, through: :group_users

  accepts_nested_attributes_for :group_users, allow_destroy: true,
                                              reject_if: -> (params) { params[:user_id].blank? }

  private

  # Set default values
  def set_defaults
    return if !course || !creator
    return if !course.course_users.exists?(user: creator) || group_users.exists?(user: creator)
    group_users.build(user: creator, role: :manager, creator: creator, updater: updater)
  end

  def remove_duplicate_users
    new_group_users = group_users.select(&:new_record?)
    users_to_remove = new_group_users - new_group_users.uniq(&:user)

    users_to_remove.each do |group_user|
      group_users.delete(group_user)
    end
  end
end
