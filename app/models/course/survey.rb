# frozen_string_literal: true
class Course::Survey < ActiveRecord::Base
  acts_as_lesson_plan_item has_todo: true

  enum question_type: { text_response: 0, multiple_choice: 1, multiple_response: 2 }

  # To call Course::Survey::Response.name to force it to load. Otherwise, there might be issues
  # with autoloading of files in production where eager_load is enabled.
  has_many :responses, inverse_of: :survey, dependent: :destroy,
                       class_name: Course::Survey::Response.name
  has_many :questions, through: :sections
  has_many :sections, inverse_of: :survey, dependent: :destroy
end
