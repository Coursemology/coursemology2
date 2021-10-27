# frozen_string_literal: true
class CourseUser < ApplicationRecord
  include CourseUser::StaffConcern
  include CourseUser::LevelProgressConcern
  include CourseUser::TodoConcern

  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  enum role: { student: 0, teaching_assistant: 1, manager: 2, owner: 3, observer: 4 }
  enum timeline_algorithm: { fixed: 0, fomo: 1, stragglers: 2, otot: 3 }

  # A set of roles which comprise the staff of a course, including the observer.
  STAFF_ROLES_SYM = Set[:teaching_assistant, :manager, :owner, :observer]
  STAFF_ROLES = STAFF_ROLES_SYM.map { |v| roles[v] }.freeze

  # A set of roles which comprise of the teaching staff of a course.
  TEACHING_STAFF_ROLES = Set[:teaching_assistant, :manager, :owner].map { |v| roles[v] }.freeze

  # A set of roles which comprise the teaching assistants and managers of a course.
  TA_AND_MANAGER_ROLES = Set[:teaching_assistant, :manager].map { |v| roles[v] }.freeze

  # A set of roles which comprise the managers of a course.
  MANAGER_ROLES = Set[:manager, :owner].map { |v| roles[v] }.freeze

  validates :role, presence: true
  validates :name, length: { maximum: 255 }, presence: true
  validates :phantom, inclusion: { in: [true, false] }
  validates :creator, presence: true
  validates :updater, presence: true
  validates :user, presence: true, uniqueness: { scope: [:course_id], if: -> { course_id? && user_id_changed? } }
  validates :course, presence: true, uniqueness: { scope: [:user_id], if: -> { user_id? && course_id_changed? } }

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
  has_many :personal_times, class_name: Course::PersonalTime.name, inverse_of: :course_user, dependent: :destroy
  belongs_to :reference_timeline, class_name: Course::ReferenceTimeline.name, inverse_of: :course_users, optional: true

  validate :validate_reference_timeline_belongs_to_course

  # @!attribute [r] experience_points
  #   Sums the total experience points for the course user.
  #   Default value is 0 when CourseUser does not have Course::ExperiencePointsRecord
  calculated :experience_points, (lambda do
    # Course::ExperiencePointsRecord.selecting { coalesce(sum(points_awarded), 0) }.
    #   where('course_experience_points_records.course_user_id = course_users.id')
    Course::ExperiencePointsRecord.select('COALESCE(SUM(points_awarded), 0)').
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

  # @!attribute [r] video_percent_watched
  #   Average the percent of videos watched by the course user.
  calculated :video_percent_watched, (lambda do
    Course::Video::Submission::Statistic.select('round(avg(percent_watched), 1)').
      joins(submission: { video: :tab }).
      where('course_video_submissions.creator_id = course_users.user_id').
      where('course_video_tabs.course_id = course_users.course_id')
  end)

  # @!attribute [r] video_submission_count
  #   Returns the total number of video submissions by CourseUser in this course
  calculated :video_submission_count, (lambda do
    Course::Video::Submission.select('count(*)').
      joins(video: :tab).
      where('course_video_submissions.creator_id = course_users.user_id').
      where('course_video_tabs.course_id = course_users.course_id')
  end)

  scope :staff, -> { where(role: STAFF_ROLES) }
  scope :teaching_staff, -> { where(role: TEACHING_STAFF_ROLES) }
  scope :teaching_assistant_and_manager, (lambda do
    where(role: TA_AND_MANAGER_ROLES)
  end)
  scope :managers, -> { where(role: MANAGER_ROLES) }
  scope :instructors, -> { staff }
  scope :students, -> { where(role: :student) }
  scope :phantom, -> { where(phantom: true) }
  scope :without_phantom_users, -> { where(phantom: false) }
  scope :with_course_statistics, -> { all.calculated(:experience_points, :achievement_count) }
  scope :with_video_statistics, -> { all.calculated(:video_percent_watched, :video_submission_count) }

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
  scope :order_phantom_user, ->(direction = :desc) { order(phantom: direction) }
  scope :active_in_past_7_days, -> { where('last_active_at > ?', 7.days.ago) }

  scope :from_instance, (lambda do |instance|
    joins(:course).where(Course.arel_table[:instance_id].eq(instance.id))
    # joining { course }.
    # where.has { course.instance_id == instance.id }
  end)

  scope :for_user, (lambda do |user|
    # where.has { user_id == user.id }
    where(user_id: user.id)
  end)

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
    MANAGER_ROLES.include?(CourseUser.roles[role.to_sym])
  end

  # Test whether this course_user is a staff (i.e. teaching_assistant, manager, owner or observer)
  #
  # @return [Boolean] True if course_user is a staff
  def staff?
    STAFF_ROLES.include?(CourseUser.roles[role.to_sym])
  end

  # Test whether this course_user is a teaching staff (i.e. teaching_assistant, manager or owner)
  #
  # @return [Boolean] True if course_user is a staff
  def teaching_staff?
    TEACHING_STAFF_ROLES.include?(CourseUser.roles[role.to_sym])
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
    # CourseUser.joining { group_users.group }.merge(Course::GroupUser.normal).
    #   where.has { group_users.group.id.in(my_groups) }
    CourseUser.joins(group_users: :group).merge(Course::GroupUser.normal).
      where(Course::Group.arel_table[:id].in(group_users.manager.pluck(:group_id)))
  end

  # Returns the managers of the groups I belong to in the course.
  #
  # @return[Array<CourseUser>]
  def my_managers
    my_groups = group_users.pluck(:group_id)
    # CourseUser.joining { group_users.group }.merge(Course::GroupUser.manager).
    #   where.has { group_users.group.id.in(my_groups) }
    CourseUser.joins(group_users: :group).merge(Course::GroupUser.manager).
      where(Course::Group.arel_table[:id].in(my_groups))
  end

  private

  def set_defaults # :nodoc:
    self.name ||= user.name if user
    self.role ||= :student
  end

  # TODO(#3092): Validation is correct but everyone's reference timeline should be nil
  def validate_reference_timeline_belongs_to_course
    return if reference_timeline.nil?
    return if reference_timeline.course == course

    errors.add(:reference_timeline, :belongs_to_course)
  end
end
