class Course::Group < ActiveRecord::Base
  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  validate :users_are_unique

  belongs_to :course, inverse_of: :groups
  has_many :group_users, inverse_of: :course_group, dependent: :destroy,
                         class_name: Course::GroupUser.name, foreign_key: :course_group_id
  has_many :users, through: :group_users

  accepts_nested_attributes_for :group_users, allow_destroy: true,
                                              reject_if: -> (params) { params[:user_id].blank? }

  private

  # Set default values
  def set_defaults
    group_users.build(user: creator, role: :manager,
                      creator: creator, updater: updater) if should_create_manager?
  end

  # Checks if the current group has sufficient information to have a manager, but does not
  # currently exist.
  #
  # @return [bool]
  def should_create_manager?
    course && creator &&
      course.course_users.exists?(user: creator) &&
      !group_users.exists?(user: creator)
  end

  def users_are_unique
    new_group_users = group_users.select(&:new_record?)
    return if new_group_users.count == new_group_users.uniq(&:user).count

    errors.add(:'group_users.user_id',  I18n.t('errors.messages.taken'))
  end
end
