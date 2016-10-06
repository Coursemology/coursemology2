# frozen_string_literal: true
class Course::LessonPlan::Todo < ActiveRecord::Base
  include Workflow

  workflow do
    state :not_started do
      event :start, transitions_to: :in_progress
    end
    state :in_progress do
      event :complete, transitions_to: :completed
      event :revert, transitions_to: :not_started
    end
    state :completed do
      event :restart, transitions_to: :not_started
    end
  end

  belongs_to :user, inverse_of: :todos
  belongs_to :item, class_name: Course::LessonPlan::Item.name, inverse_of: :todos

  after_initialize :set_default_values, if: :new_record?

  class << self
    # Creates todos to the given course_users for the given lesson_plan_item(s).
    #
    # @param [Course::LessonPlan::Item|Array<Course::LessonPlan::Item>] item
    #   The lesson_plan_item, or array of lesson_plan_items to create todos for.
    # @param [CourseUser|Array<CourseUser>] course_users
    #   The course_user, or array of course_users to create todos for.
    # @return [Array<Course::LessonPlan::Todo>|nil] Array of created todos, or nil if invalid params
    def create_for(items, course_users)
      return unless items && course_users
      items = [items] if items.is_a?(Course::LessonPlan::Item)
      course_users = [course_users] if course_users.is_a?(CourseUser)
      user_item_hash = items.product(course_users).map { |ary| { item: ary[0], user: ary[1].user } }
      Course::LessonPlan::Todo.create(user_item_hash)
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

  private

  # Sets default values
  def set_default_values
    self.ignore ||= false
  end
end
