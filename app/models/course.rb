class Course < ActiveRecord::Base
  include Course::LevelsConcern
  include Course::LessonPlanConcern

  acts_as_tenant :instance
  has_settings_on :settings

  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  enum status: { closed: 0, published: 1, opened: 2 }

  has_many :course_users, inverse_of: :course, dependent: :destroy
  # @!attribute [r] users
  # Returns all the users related to the course regardless of course_user state.
  # Note that if you only want approved users you should call +users.with_approved_state+ instead.
  has_many :users, through: :course_users do
    include CourseUser::UsersConcern
  end
  has_many :invitations, through: :course_users
  has_many :activities, dependent: :destroy
  has_many :notifications, through: :activities, source: :course_notifications, dependent: :destroy

  has_many :announcements, inverse_of: :course, dependent: :destroy
  has_many :achievements, inverse_of: :course, dependent: :destroy
  has_many :assessment_categories, class_name: Course::Assessment::Category.name,
                                   inverse_of: :course, dependent: :destroy
  has_many :assessments, through: :assessment_categories
  has_many :levels, inverse_of: :course, dependent: :destroy
  has_many :groups, inverse_of: :course, dependent: :destroy, class_name: Course::Group.name
  has_many :lesson_plan_items, inverse_of: :course, dependent: :destroy
  has_many :lesson_plan_milestones, inverse_of: :course, dependent: :destroy
  has_many :events, through: :lesson_plan_items, source: :actable, source_type: Course::Event.name

  accepts_nested_attributes_for :invitations

  delegate :staff, to: :course_users
  delegate :instructors, to: :course_users
  delegate :has_user?, to: :course_users

  def self.use_relative_model_naming?
    true
  end

  # Generates a registration key for use with the course.
  def generate_registration_key
    self.registration_key = 'C'.freeze + SecureRandom.base64(8)
  end

  private

  # Set default values
  def set_defaults
    self.start_at ||= Time.zone.now
    self.end_at ||= 1.month.from_now

    course_users.build(user: creator, role: :owner, workflow_state: :approved, creator: creator,
                       updater: updater) if creator && course_users.empty?
  end
end
