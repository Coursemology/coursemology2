# frozen_string_literal: true
class Course::LessonPlan::Todo < ApplicationRecord
  include Workflow

  workflow do
    state :not_started
    state :in_progress
    state :completed
  end

  after_initialize :set_default_values, if: :new_record?

  validates :workflow_state, length: { maximum: 255 }, presence: true
  validates :ignore, inclusion: { in: [true, false] }
  validates :creator, presence: true
  validates :updater, presence: true
  validates :user, presence: true
  validates :item, presence: true
  validates :user_id, uniqueness: { scope: [:item_id], if: -> { item_id? && user_id_changed? } }
  validates :item_id, uniqueness: { scope: [:user_id], allow_nil: true, if: -> { user_id? && item_id_changed? } }

  belongs_to :user, inverse_of: :todos
  belongs_to :item, class_name: Course::LessonPlan::Item.name, inverse_of: :todos

  # Started is not used as it is defined in Extensions::TimeBoundedRecord::ActiveRecord::Base
  scope :opened, (lambda do
    includes(item: { reference_times: :reference_timeline }).
      where(course_reference_timelines: { default: true }).
      merge(Course::ReferenceTime.where('course_reference_times.start_at <= ?', Time.zone.now)).
      references(reference_times: :reference_timeline)
  end)
  scope :published, -> { joins(:item).where('course_lesson_plan_items.published = ?', true) }
  scope :not_ignored, -> { where(ignore: false) }
  scope :not_completed, -> { where.not(workflow_state: :completed) }
  scope :from_course, (lambda do |course|
    includes(:item).where('course_lesson_plan_items.course_id = ?', course.id).references(:item)
  end)
  scope :pending_for, (lambda do |course_user|
    opened.published.not_ignored.from_course(course_user.course).not_completed.
      where('course_lesson_plan_todos.user_id = ?', course_user.user_id)
  end)
  scope :ordered_by_date, (lambda do
    includes(item: { reference_times: :reference_timeline }).
      where(course_reference_timelines: { default: true }).
      merge(Course::ReferenceTime.order(:start_at)).
      references(reference_times: :reference_timeline)
  end)

  class << self
    # Creates todos to the given course_users for the given lesson_plan_item(s).
    # This uses bulk imports, hence callbacks for todos will not be called upon creation.
    #
    # @param [Course::LessonPlan::Item|Array<Course::LessonPlan::Item>] item
    #   The lesson_plan_item, or array of lesson_plan_items to create todos for.
    # @param [CourseUser|Array<CourseUser>] course_users
    #   The course_user, or array of course_users to create todos for.
    # @return [Array<String>] Array of string of ids of successfully created todos.
    def create_for!(items, course_users)
      return unless items && course_users
      items = [items] if items.is_a?(Course::LessonPlan::Item)
      course_users = [course_users] if course_users.is_a?(CourseUser)
      result = Course::LessonPlan::Todo.
               import(*build_import_attributes_for(items, course_users), validate: false)
      result.ids
    end

    # Destroy todos for the associated lesson_plan_item for specified course_users.
    #   If no course_user is specified, destroy all todos for that lesson_plan_item.
    #
    # @param [Course::LessonPlan::Item] item Item's todos to be deleted
    # @param [Array<CourseUser>] course_users If specified, filter of course_users to delete todos.
    # @return [Array<Course::LessonPlan::Todo>|nil] The todos that are deleted, or nil if invalid
    #   params
    def delete_for(item, course_users = nil)
      return unless item
      user_ids = course_users ? course_users.select(:user_id) : item.todos.select(:user_id)
      item.todos.where.has { user_id.in(user_ids) }.destroy_all
    end

    private

    # Constructs and returns the column and attribute hash. This is required for
    # the +import+ function for the activerecord-import gem to support bulk inserts.
    #
    # @param [Array<Course::LessonPlan::Item>] Array of lesson_plan_items
    # @param [Array<CourseUser>] Array of course_users
    # @return [Array<Array<Symbol>, Array<Integer, String>] Returns an array with 2 arrays:
    #   (i) array of columns, (ii) array of data arranged in columns specified in (i).
    def build_import_attributes_for(items, course_users)
      columns = [:item_id, :user_id, :creator_id, :updater_id, :workflow_state]
      values =
        items.product(course_users).map do |item, course_user|
          [item.id, course_user.user_id, item.creator_id, item.creator_id, 'not_started']
        end
      [columns, values]
    end
  end

  # Checks if item can be started by user. #can_start? must be implemented by lesson_plan_item's
  #   actable class, otherwise all item's are true by default.
  #
  # @return [Boolean] Whether the todo can be started or not.
  def can_user_start?
    item.can_user_start?(user)
  end

  private

  # Sets default values
  def set_default_values
    self.ignore ||= false
  end
end
