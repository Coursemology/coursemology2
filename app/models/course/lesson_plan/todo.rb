# frozen_string_literal: true
class Course::LessonPlan::Todo < ActiveRecord::Base
  include Workflow

  workflow do
    state :not_started
    state :in_progress
    state :completed
  end

  after_initialize :set_default_values, if: :new_record?

  belongs_to :user, inverse_of: :todos
  belongs_to :item, class_name: Course::LessonPlan::Item.name, inverse_of: :todos

  default_scope { joins { item }.order { item.start_at.asc } }

  # Started is not used as it is defined in Extensions::TimeBoundedRecord::ActiveRecord::Base
  scope :opened, -> { joins { item }.where { item.start_at <= Time.zone.now } }
  scope :published, -> { joins { item }.where { item.published == true } }
  scope :not_ignored, -> { where(ignore: false) }
  scope :not_completed, -> { where.not(workflow_state: :completed) }
  scope :from_course, (lambda do |course|
    joins { item }.where { item.course_id == course.id }
  end)
  scope :pending_for, (lambda do |course_user|
    opened.published.not_ignored.from_course(course_user.course).not_completed.
      where { user_id == course_user.user_id }
  end)

  class << self
    # Creates todos to the given course_users for the given lesson_plan_item(s).
    #
    # @param [Course::LessonPlan::Item|Array<Course::LessonPlan::Item>] item
    #   The lesson_plan_item, or array of lesson_plan_items to create todos for.
    # @param [CourseUser|Array<CourseUser>] course_users
    #   The course_user, or array of course_users to create todos for.
    # @return [Array<Course::LessonPlan::Todo>|nil] Array of created todos, or nil if invalid params
    # @raise [ActiveRecord::RecordInvalid] Raised if the validations to create todo fails.
    def create_for!(items, course_users)
      return unless items && course_users
      items = [items] if items.is_a?(Course::LessonPlan::Item)
      course_users = [course_users] if course_users.is_a?(CourseUser)
      user_item_hash = items.product(course_users).map { |ary| { item: ary[0], user: ary[1].user } }
      Course::LessonPlan::Todo.create!(user_item_hash)
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
      item.todos.where { user_id.in(user_ids) }.destroy_all
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
