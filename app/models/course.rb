# frozen_string_literal: true
class Course < ActiveRecord::Base
  include Course::LessonPlanConcern
  include Course::SearchConcern

  acts_as_tenant :instance, inverse_of: :courses
  has_settings_on :settings
  mount_uploader :logo, ImageUploader

  after_initialize :set_defaults, if: :new_record?
  before_validation :set_defaults, if: :new_record?

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
  has_many :assessment_categories, class_name: Course::Assessment::Category.name,
                                   dependent: :destroy, inverse_of: :course
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
  has_many :lesson_plan_milestones, class_name: Course::LessonPlan::Milestone.name,
                                    dependent: :destroy
  has_many :lesson_plan_events, through: :lesson_plan_items,
                                source: :actable, source_type: Course::LessonPlan::Event.name
  # Achievements must be declared after material_folders or duplication will fail.
  has_many :achievements, dependent: :destroy
  has_many :discussion_topics, class_name: Course::Discussion::Topic.name, inverse_of: :course
  has_many :forums, dependent: :destroy, inverse_of: :course
  has_many :surveys, through: :lesson_plan_items, source: :actable, source_type: Course::Survey.name
  has_many :videos, through: :lesson_plan_items, source: :actable, source_type: Course::Video.name

  accepts_nested_attributes_for :invitations, :assessment_categories

  scope :ordered_by_title, -> { order(:title) }
  scope :ordered_by_start_at, ->(direction = :desc) { order(start_at: direction) }
  scope :ordered_by_end_at, ->(direction = :desc) { order(end_at: direction) }
  scope :publicly_accessible, -> { where(published: true) }

  # @!method containing_user
  #   Selects all the courses with user as one of its members
  scope :containing_user, (lambda do |user|
    joins(:course_users).where('course_users.user_id = ?', user.id)
  end)

  # @!method with_owners
  #   Includes all course_users with the role of owner.
  scope :with_owners, (lambda do
    course_users = CourseUser.owner.where(course: pluck(:id)).includes(:user)

    all.tap do |result|
      preloader = ActiveRecord::Associations::Preloader::ManualPreloader.new
      preloader.preload(result, :course_users, course_users)
    end
  end)

  delegate :staff, to: :course_users
  delegate :instructors, to: :course_users
  delegate :managers, to: :course_users
  delegate :user?, to: :course_users
  delegate :level_for, to: :levels
  delegate :default_level?, to: :levels

  def self.use_relative_model_naming?
    true
  end

  # Generates a registration key for use with the course.
  def generate_registration_key
    self.registration_key = 'C'.freeze + SecureRandom.base64(8)
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
    settings(:course).advance_start_at_duration
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

  def initialize_duplicate(duplicator, other)
    self.start_at += duplicator.time_shift
    self.end_at += duplicator.time_shift
    self.title = duplicator.options[:new_title]
    self.creator = duplicator.options[:current_user]
    self.registration_key = nil
    logo.duplicate_from(other.logo) if other.logo_url

    # This also duplicates assessments.
    self.lesson_plan_items = duplicator.duplicate(other.lesson_plan_items.map(&:actable)).
                             map(&:acting_as)
    self.lesson_plan_milestones = duplicator.duplicate(other.lesson_plan_milestones)

    # Find concrete material_folders and only duplicate those.
    # This must be done after duplicating assessments.
    # Do not try duplicating all folders at once. Parent IDs do not seem to be populated by the
    # edge gem until the database entries are created.
    material_folders_to_duplicate = other.material_folders.concrete
    self.material_folders = duplicator.duplicate(material_folders_to_duplicate).compact

    # Skill branches are duplicated as part of skills.
    self.assessment_skills = duplicator.duplicate(other.assessment_skills)

    self.levels = duplicator.duplicate(other.levels)
    self.achievements = duplicator.duplicate(other.achievements)
    self.forums = duplicator.duplicate(other.forums)
  end

  private

  # Set default values
  def set_defaults
    self.start_at ||= Time.zone.now.beginning_of_hour
    self.end_at ||= self.start_at + 1.month

    return unless creator && course_users.empty?
    course_users.build(user: creator, role: :owner, creator: creator, updater: updater)
  end
end
