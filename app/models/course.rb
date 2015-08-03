class Course < ActiveRecord::Base
  include Course::LevelsConcern
  include Course::LessonPlanConcern

  acts_as_tenant :instance, inverse_of: :courses
  has_settings_on :settings

  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  enum status: { closed: 0, published: 1, opened: 2 }

  belongs_to :instance, inverse_of: :courses
  has_many :course_users, inverse_of: :course, dependent: :destroy
  # @!attribute [r] users
  # Returns all the users related to the course regardless of course_user state.
  # Note that if you only want approved users you should call +users.with_approved_state+ instead.
  has_many :users, through: :course_users do
    include CourseUser::UsersConcern
  end
  has_many :invitations, through: :course_users
  has_many :notifications, dependent: :destroy

  has_many :announcements, dependent: :destroy
  has_many :achievements, dependent: :destroy
  has_many :assessment_categories, class_name: Course::Assessment::Category.name,
                                   dependent: :destroy, inverse_of: :course
  has_many :assessments, through: :assessment_categories
  has_many :levels, dependent: :destroy
  has_many :groups, dependent: :destroy, class_name: Course::Group.name
  has_many :lesson_plan_items, class_name: Course::LessonPlan::Item.name, dependent: :destroy
  has_many :lesson_plan_milestones, class_name: Course::LessonPlan::Milestone.name,
                                    dependent: :destroy
  has_many :lesson_plan_events, through: :lesson_plan_items,
                                source: :actable, source_type: Course::LessonPlan::Event.name

  accepts_nested_attributes_for :invitations, :assessment_categories

  scope :ordered_by_title, -> { order(:title) }

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
