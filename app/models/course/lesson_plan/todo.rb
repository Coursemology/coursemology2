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

  private

  # Sets default values
  def set_default_values
    self.ignore ||= false
  end
end
