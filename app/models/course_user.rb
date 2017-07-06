# frozen_string_literal: true
class CourseUser < ActiveRecord::Base
  include CourseUser::StaffConcern
  include CourseUser::LevelProgressConcern
  include CourseUser::TodoConcern

  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  enum role: { student: 0, teaching_assistant: 1, manager: 2, owner: 3 }

  # A set of roles which comprise the staff of a course.
  STAFF_ROLES = Set[:teaching_assistant, :manager, :owner].freeze

  # A set of roles which comprise the teaching assistants and managers of a course.
  TA_AND_MANAGER_ROLES = Set[:teaching_assistant, :manager].freeze

  # A set of roles which comprise the managers of a course.
  MANAGER_ROLES = Set[:manager, :owner].freeze

  belongs_to :user, inverse_of: :course_users
  belongs_to :course, inverse_of: :course_users
  has_many :experience_points_records, class_name: Course::ExperiencePointsRecord.name,
                                       inverse_of: :course_user, dependent: :destroy
  has_many :course_user_achievements, class_name: Course::UserAchievement.name,
                                      inverse_of: :course_user, dependent: :destroy
  has_many :achievements, through: :course_user_achievements,
                          class_name: Course::Achievement.name do
    include CourseUser::AchievementsConcern
  end
  has_many :group_users, class_name: Course::GroupUser.name,
                         inverse_of: :course_user, dependent: :destroy
  has_many :groups, through: :group_users, class_name: Course::Group.name, source: :group

  # @!attribute [r] experience_points
  #   Sums the total experience points for the course user.
  #   Default value is 0 when CourseUser does not have Course::ExperiencePointsRecord
  calculated :experience_points, (lambda do
    Course::ExperiencePointsRecord.selecting { coalesce(sum(points_awarded), 0) }.
      where('course_experience_points_records.course_user_id = course_users.id')
  end)

  # @!attribute [r] last_experience_points_record
  #   Returns the time of the last awarded experience points record.
  calculated :last_experience_points_record, (lambda do
    Course::ExperiencePointsRecord.select(:awarded_at).limit(1).order(awarded_at: :desc).
      where('course_experience_points_records.course_user_id = course_users.id').
      where('course_experience_points_records.awarded_at IS NOT NULL')
  end)

  # @!attribute [r] achievement_count
  #   Returns the total number of achievements obtained by CourseUser in this course
  calculated :achievement_count, (lambda do
    Course::UserAchievement.select("count('*')").
      where('course_user_achievements.course_user_id = course_users.id')
  end)

  # @!attribute [r] last_obtained_achievement
  #   Returns the time of the last obtained achievement
  calculated :last_obtained_achievement, (lambda do
    Course::UserAchievement.select(:obtained_at).limit(1).order(obtained_at: :desc).
      where('course_user_achievements.course_user_id = course_users.id')
  end)

  # Gets the staff associated with the course.
  # TODO: Remove the map when Rails 5 is released.
  scope :staff, -> { where(role: STAFF_ROLES.map { |x| roles[x] }) }
  scope :teaching_assistant_and_manager, (lambda do
    where(role: TA_AND_MANAGER_ROLES.map { |x| roles[x] })
  end)
  scope :managers, -> { where(role: MANAGER_ROLES.map { |x| roles[x] }) }
  scope :instructors, -> { staff }
  scope :students, -> { where(role: roles[:student]) }
  scope :phantom, -> { where(phantom: true) }
  scope :without_phantom_users, -> { where(phantom: false) }
  scope :with_course_statistics, -> { all.calculated(:experience_points, :achievement_count) }

  # Order course_users by experience points for use in the course leaderboard.
  #   In the event of a tie in points, the scope will then sort by course_users who
  #   obtained the current experience points first.
  scope :ordered_by_experience_points, (lambda do
    all.calculated(:experience_points, :last_experience_points_record).
      order('experience_points DESC, last_experience_points_record ASC')
  end)

  # Order course_users by achievement count for use in the course leaderboard.
  #   In the event of a tie in count, the scope will then sort by course_users who
  #   obtained the current achievement count first.
  scope :ordered_by_achievement_count, (lambda do
    all.calculated(:achievement_count, :last_obtained_achievement).
      order('achievement_count DESC, last_obtained_achievement ASC')
  end)

  scope :order_alphabetically, ->(direction = :asc) { order(name: direction) }

  # Test whether the current scope includes the current user.
  #
  # @param [User] user The user to check
  # @return [Boolean] True if the user exists in the current context
  def self.user?(user)
    all.exists?(user: user)
  end

  # Test whether this course_user is a manager (i.e. manager or owner)
  #
  # @return [Boolean] True if course_user is a staff
  def manager_or_owner?
    MANAGER_ROLES.include?(role.to_sym)
  end

  # Test whether this course_user is a staff (i.e. teaching_assistant, manager or owner)
  #
  # @return [Boolean] True if course_user is a staff
  def staff?
    STAFF_ROLES.include?(role.to_sym)
  end

  # Test whether this course_user is a real student (i.e. not phantom and not staff)
  #
  # @return [Boolean]
  def real_student?
    student? && !phantom
  end

  # Returns my students in the course.
  # If a course_user is the manager of a group, all other users in the group with the group role of
  # normal will be considered as the students of the course_user.
  #
  # @return[Array<CourseUser>]
  def my_students
    my_groups = group_users.manager.select(:group_id)
    CourseUser.joining { group_users.group }.merge(Course::GroupUser.normal).
      where.has { group_users.group.id.in(my_groups) }
  end

  # Returns the managers of the groups I belong to in the course.
  #
  # @return[Array<CourseUser>]
  def my_managers
    my_groups = group_users.select(:group_id)
    CourseUser.joining { group_users.group }.merge(Course::GroupUser.manager).
      where.has { group_users.group.id.in(my_groups) }
  end

  private

  def set_defaults # :nodoc:
    self.name ||= user.name if user
  end
end
