# frozen_string_literal: true
class Course < ActiveRecord::Base
  include Course::LevelsConcern
  include Course::LessonPlanConcern
  include Course::SearchConcern

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
  # The order needs to be preserved, this makes sure that the root_folder will be saved first
  has_many :material_folders, class_name: Course::Material::Folder.name, inverse_of: :course,
                              dependent: :destroy
  has_many :assessment_categories, class_name: Course::Assessment::Category.name,
                                   dependent: :destroy, inverse_of: :course
  has_many :assessments, through: :assessment_categories
  has_many :assessment_programming_evaluations,
           class_name: Course::Assessment::ProgrammingEvaluation.name, dependent: :destroy,
           inverse_of: :course
  has_many :levels, dependent: :destroy, inverse_of: :course
  has_many :groups, dependent: :destroy, class_name: Course::Group.name
  has_many :lesson_plan_items, class_name: Course::LessonPlan::Item.name, dependent: :destroy
  has_many :lesson_plan_milestones, class_name: Course::LessonPlan::Milestone.name,
                                    dependent: :destroy
  has_many :lesson_plan_events, through: :lesson_plan_items,
                                source: :actable, source_type: Course::LessonPlan::Event.name
  has_many :forums, dependent: :destroy

  accepts_nested_attributes_for :invitations, :assessment_categories

  scope :ordered_by_title, -> { order(:title) }

  # @!method with_owners
  #   Includes all course_users with the role of owner.
  scope :with_owners, (lambda do
    course_users = CourseUser.owner.with_approved_state.where(course: pluck(:id)).includes(:user)

    all.tap do |result|
      preloader = ActiveRecord::Associations::Preloader::ManualPreloader.new
      preloader.preload(result, :course_users, course_users)
    end
  end)

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

  # Returns the root folder of the course.
  # @return [Course::Material::Folder] The root folder.
  def root_folder
    if new_record?
      material_folders.find(&:root?) || (fail ActiveRecord::RecordNotFound)
    else
      material_folders.find_by!(parent: nil)
    end
  end

  # Test if the course has a root folder.
  # @return [Boolean] True if there is a root folder, otherwise false.
  def has_root_folder?
    if new_record?
      material_folders.find(&:root?).present?
    else
      material_folders.find_by(parent: nil).present?
    end
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
