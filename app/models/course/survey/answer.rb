# frozen_string_literal: true
class Course::Survey::Answer < ActiveRecord::Base
  belongs_to :response, inverse_of: :answers
  belongs_to :question, inverse_of: :answers
  has_many :options, class_name: Course::Survey::AnswerOption.name,
                     inverse_of: :answer, dependent: :destroy

  accepts_nested_attributes_for :options

  def build_missing_options
    options_hash = {}.tap do |hash|
      options.each { |option| hash[option.question_option_id] = option }
    end
    question.options.each do |option|
      options.build(question_option: option) unless options_hash[option.id]
    end
    self
  end
end
