# frozen_string_literal: true
class Course < ApplicationRecord
  include Course::LessonPlanConcern
  include Course::SearchConcern
  include Course::DuplicationConcern
  include Course::CourseComponentsConcern
  include TimeZoneConcern

  acts_as_tenant :instance, inverse_of: :courses
  has_settings_on :settings
  mount_uploader :logo, ImageUploader

  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

  validates :title, length: { maximum: 255 }, presence: true
  validates :registration_key, length: { maximum: 16 }, uniqueness: { if: :registration_key_changed? }, allow_nil: true

  validates :start_at, presence: true
  validates :end_at, presence: true
  validates :gamified, inclusion: { in: [true, false] }
  validates :published, inclusion: { in: [true, false] }
  validates :enrollable, inclusion: { in: [true, false] }
  validates :time_zone, length: { maximum: 255 }, allow_nil: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :instance, presence: true

  belongs_to :instance, inverse_of: :courses
  has_many :enrol_requests, inverse_of: :course, dependent: :destroy
  has_many :course_users, inverse_of: :course, dependent: :destroy
  has_many :users, through: :course_users
  has_many :invitations, class_name: Course::UserInvitation.name, dependent: :destroy,
                         inverse_of: :course
  has_many :notifications, dependent: :destroy

  has_many :announcements, dependent: :destroy
  has_many :virtual_classrooms, dependent: :destroy
  # The order needs to be preserved, this makes sure that the root_folder will be saved first
  has_many :material_folders, class_name: Course::Material::Folder.name, inverse_of: :course,
                              dependent: :destroy
  has_many :materials, through: :material_folders
  has_many :assessment_categories, class_name: Course::Assessment::Category.name,
                                   dependent: :destroy, inverse_of: :course
  has_many :assessment_tabs, source: :tabs, through: :assessment_categories
  has_many :assessments, through: :assessment_categories
  has_many :assessment_skills, class_name: Course::Assessment::Skill.name,
                               dependent: :destroy
  has_many :assessment_skill_branches, class_name: Course::Assessment::SkillBranch.name,
                                       dependent: :destroy
  has_many :levels, dependent: :destroy, inverse_of: :course do
    include Course::LevelsConcern
  end
  has_many :groups, dependent: :destroy, class_name: Course::Group.name
  has_many :lesson_plan_items, class_name: Course::LessonPlan::Item.name, dependent: :destroy
  has_many :lesson_plan_milestones, through: :lesson_plan_items,
                                    source: :actable, source_type: Course::LessonPlan::Milestone.name
  has_many :lesson_plan_events, through: :lesson_plan_items,
                                source: :actable, source_type: Course::LessonPlan::Event.name
  # Achievements must be declared after material_folders or duplication will fail.
  has_many :achievements, dependent: :destroy
  has_many :discussion_topics, class_name: Course::Discussion::Topic.name, inverse_of: :course
  has_many :forums, dependent: :destroy, inverse_of: :course
  has_many :surveys, through: :lesson_plan_items, source: :actable, source_type: Course::Survey.name
  has_many :videos, through: :lesson_plan_items, source: :actable, source_type: Course::Video.name
  has_many :video_tabs, class_name: Course::Video::Tab.name, inverse_of: :course, dependent: :destroy

  has_many :reference_timelines, class_name: Course::ReferenceTimeline.name, inverse_of: :course, dependent: :destroy
  has_one :default_reference_timeline, -> { where(default: true) },
          class_name: Course::ReferenceTimeline.name, inverse_of: :course
  validates :default_reference_timeline, presence: true
  validate :validate_only_one_default_reference_timeline

  accepts_nested_attributes_for :invitations, :assessment_categories, :video_tabs

  calculated :user_count, (lambda do
    CourseUser.select("count('*')").
      where('course_users.course_id = courses.id').merge(CourseUser.student)
  end)

  calculated :active_user_count, (lambda do
    CourseUser.select("count('*')").
      where('course_users.course_id = courses.id').merge(CourseUser.active_in_past_7_days).merge(CourseUser.student)
  end)

  scope :ordered_by_title, -> { order(:title) }
  scope :ordered_by_start_at, ->(direction = :desc) { order(start_at: direction) }
  scope :ordered_by_end_at, ->(direction = :desc) { order(end_at: direction) }
  scope :publicly_accessible, -> { where(published: true) }
  scope :current, -> { where('end_at > ?', Time.zone.now)}
  scope :completed, -> { where('end_at <= ?', Time.zone.now) }

  # @!method containing_user
  #   Selects all the courses with user as one of its members
  scope :containing_user, (lambda do |user|
    joins(:course_users).where('course_users.user_id = ?', user.id)
  end)

  scope :active_in_past_7_days, (lambda do
    joins(:course_users).merge(CourseUser.active_in_past_7_days).merge(CourseUser.student).distinct
  end)

  delegate :staff, to: :course_users
  delegate :instructors, to: :course_users
  delegate :managers, to: :course_users
  delegate :user?, to: :course_users
  delegate :level_for, to: :levels
  delegate :default_level?, to: :levels
  delegate :mass_update_levels, to: :levels

  def self.use_relative_model_naming?
    true
  end

  # Generates a registration key for use with the course.
  def generate_registration_key
    self.registration_key = 'C' + SecureRandom.base64(8)
  end

  def code_registration_enabled?
    registration_key.present?
  end

  # Returns the root folder of the course.
  # @return [Course::Material::Folder] The root folder.
  def root_folder
    if new_record?
      material_folders.find(&:root?) || (raise ActiveRecord::RecordNotFound)
    else
      material_folders.find_by!(parent: nil)
    end
  end

  # Test if the course has a root folder.
  # @return [Boolean] True if there is a root folder, otherwise false.
  def root_folder?
    if new_record?
      material_folders.find(&:root?).present?
    else
      material_folders.find_by(parent: nil).present?
    end
  end

  # This is the max time span that the student can access a future assignment.
  # Used in self directed mode, which will allow students to access course contents in advance
  # before they have started.
  #
  # @return [ActiveSupport::Duration]
  def advance_start_at_duration
    settings(:course).advance_start_at_duration || 0
  end

  def advance_start_at_duration=(time)
    settings(:course).advance_start_at_duration = time
  end

  # Convert the days to time duration and store it.
  def advance_start_at_duration_days=(value)
    value = if value.present? && value.to_i > 0
              value.to_i.days
            else
              nil
            end
    settings(:course).advance_start_at_duration = value
  end

  # Returns the first video tab in this course.
  # Usually this will be the default video tab created automatically, but may vary
  # according to settings.
  #
  # @return [Course::Video::Tab]
  def default_video_tab
    video_tabs.first
  end

  # TODO: Need to replace this with an assessment settings adapter in future
  # Course setting to enable public test cases output
  def show_public_test_cases_output
    settings(:course_assessments_component).show_public_test_cases_output
  end

  def show_public_test_cases_output=(option)
    option = ActiveRecord::Type::Boolean.new.cast(option)
    settings(:course_assessments_component).show_public_test_cases_output = option
  end

  def show_stdout_and_stderr
    settings(:course_assessments_component).show_stdout_and_stderr
  end

  def show_stdout_and_stderr=(option)
    option = ActiveRecord::Type::Boolean.new.cast(option)
    settings(:course_assessments_component).show_stdout_and_stderr = option
  end

  # Setting to allow randomization of assessment assignments
  def allow_randomization
    settings(:course_assessments_component).allow_randomization
  end

  def allow_randomization=(option)
    option = ActiveRecord::Type::Boolean.new.cast(option)
    settings(:course_assessments_component).allow_randomization = option
  end

  # Setting to allow randomization of order of displaying mrq options
  def allow_mrq_options_randomization
    settings(:course_assessments_component).allow_mrq_options_randomization
  end

  def allow_mrq_options_randomization=(option)
    option = ActiveRecord::Type::Boolean.new.cast(option)
    settings(:course_assessments_component).allow_mrq_options_randomization = option
  end

  def upcoming_lesson_plan_items_exist?
    opening_items = lesson_plan_items.published.eager_load(:personal_times, :reference_times).preload(:actable)
    opening_items.select { |item| item.actable.include_in_consolidated_email?(:opening) }.any? do |item|
      course_users.any? do |course_user|
        item.time_for(course_user).start_at.in?((Time.zone.now)..(1.day.from_now))
      end
    end
  end

  private

  # Set default values
  def set_defaults
    self.start_at ||= Time.zone.now.beginning_of_hour
    self.end_at ||= self.start_at + 1.month
    self.default_reference_timeline ||= reference_timelines.new(default: true)

    return unless creator && course_users.empty?
    course_users.build(user: creator, role: :owner, creator: creator, updater: updater)
  end

  def validate_only_one_default_reference_timeline
    num_defaults = reference_timelines.where(course_reference_timelines: { default: true }).count
    return if num_defaults <= 1 # Could be 0 if item is new
    errors.add(:reference_timelines, :must_have_at_most_one_default)
  end
end
