# frozen_string_literal: true
class Course::Survey::Answer < ActiveRecord::Base
  belongs_to :response, inverse_of: :answers
  belongs_to :question, inverse_of: :answers
  has_many :options, class_name: Course::Survey::AnswerOption.name,
                     inverse_of: :answer, dependent: :destroy

  accepts_nested_attributes_for :options
end
