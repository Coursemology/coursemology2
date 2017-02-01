# frozen_string_literal: true
class Course::Survey::Question < ActiveRecord::Base
  belongs_to :survey, inverse_of: :questions
  has_many :options, class_name: Course::Survey::QuestionOption.name,
                     inverse_of: :question, dependent: :destroy
  has_many :answers, class_name: Course::Survey::Answer.name,
                     inverse_of: :question, dependent: :destroy

  accepts_nested_attributes_for :options, allow_destroy: true
end
