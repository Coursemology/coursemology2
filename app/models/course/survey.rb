# frozen_string_literal: true
class Course::Survey < ActiveRecord::Base
  acts_as_lesson_plan_item has_todo: true

  has_many :questions, inverse_of: :survey, dependent: :destroy
  has_many :responses, inverse_of: :survey, dependent: :destroy
end
