# frozen_string_literal: true
class CourseUser < ActiveRecord::Base
  include Workflow
  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  enum role: { student: 0, teaching_assistant: 1, manager: 2, owner: 3, auto_grader: 4 }

  # A set of roles which comprise the staff of a course.
  STAFF_ROLES = Set[:teaching_assistant, :manager, :owner].freeze

  # A set of roles which comprise the managers of a course.
  MANAGER_ROLES = Set[:manager, :owner].freeze

  # A set of roles which comprise the auto graders of a course.
  AUTO_GRADER_ROLES = Set[:auto_grader].freeze

  workflow do
    state :requested do
      event :approve, transitions_to: :approved
      event :reject, transitions_to: :rejected
    end
    state :invited do
      event :accept, transitions_to: :approved
    end
    state :approved
    state :rejected
  end

  validates :user, presence: true, unless: :invited?
  validates :user, absence: true, if: :invited?

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
  has_one :invitation, class_name: Course::UserInvitation.name, dependent: :destroy, validate: true
  has_many :group_users, class_name: Course::GroupUser.name,
                         inverse_of: :course_user, dependent: :destroy
  has_many :groups, through: :group_users, class_name: Course::Group.name, source: :group

  # @!attribute [r] experience_points
  #   Sums the total experience points for the course user.
  #   Default value is 0 when CourseUser does not have Course::ExperiencePointsRecord
  calculated :experience_points, (lambda do
    Course::ExperiencePointsRecord.select do
      coalesce(sum(course_experience_points_records.points_awarded), 0)
    end.where { course_experience_points_records.course_user_id == course_users.id }
  end)

  # @!attribute [r] achievement_count
  #   Returns the total number of achievements obtained by CourseUser in this course
  calculated :achievement_count, (lambda do
    Course::UserAchievement.select { count('*') }.
      where { course_user_achievements.course_user_id == course_users.id }
  end)

  # @!attribute [r] last_obtained_achievement
  #   Returns the time of the last obtained achievement
  calculated :last_obtained_achievement, (lambda do
    Course::UserAchievement.select(:obtained_at).limit(1).order(obtained_at: :desc).
      where { course_user_achievements.course_user_id == course_users.id }
  end)

  # Gets the staff associated with the course.
  # TODO: Remove the map when Rails 5 is released.
  scope :staff, -> { where(role: STAFF_ROLES.map { |x| roles[x] }) }
  scope :managers, -> { where(role: MANAGER_ROLES.map { |x| roles[x] }) }
  scope :instructors, -> { staff }
  scope :students, -> { where(role: roles[:student]) }

  scope :without_phantom_users, -> { where(phantom: false) }
  scope :with_course_statistics, -> { all.calculated(:experience_points, :achievement_count) }
  scope :ordered_by_experience_points, (lambda do
    all.calculated(:experience_points).order('experience_points DESC')
  end)

  # Order course_users by achievement count for use in the course leaderboard.
  #   In the event of a tie in count, the scope will then sort by course_users who
  #   obtained the current achievement count first.
  scope :ordered_by_achievement_count, (lambda do
    all.calculated(:achievement_count, :last_obtained_achievement).
      order('achievement_count DESC, last_obtained_achievement ASC')
  end)

  include CourseUser::LevelProgressConcern

  # Test whether the current scope includes the current user.
  #
  # @param [User] user The user to check
  # @return [Boolean] True if the user exists in the current context
  def self.user?(user)
    with_approved_state.exists?(user: user)
  end

  # Test whether this course_user is a staff (i.e. teaching_assistant, manager or owner)
  #
  # @return [Boolean] True if course_user is a staff
  def staff?
    STAFF_ROLES.include?(role.to_sym)
  end

  # Transitions the user from the invited to the accepted state.
  #
  # @param [User] user The user which is accepting this invitation.
  # @return [void]
  def accept(user)
    self.user = user
  end

  # Callback handler for workflow state change to the rejected state.
  def on_rejected_entry(*)
    destroy
  end

  # Returns my students in the course.
  # If a course_user is the manager of a group, all other users in the group with the group role of
  # normal will be considered as the students of the course_user.
  #
  # @return[Array<CourseUser>]
  def my_students
    my_groups = group_users.manager.select(:group_id)
    CourseUser.joins { group_users.group }.merge(Course::GroupUser.normal).
      where { group_users.group.id >> my_groups }
  end

  private

  def set_defaults # :nodoc:
    self.name ||= user.name if user
  end
end
