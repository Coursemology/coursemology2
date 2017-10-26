# frozen_string_literal: true
class Course::Assessment::Question::MultipleResponseOption < ApplicationRecord
  belongs_to :question, class_name: Course::Assessment::Question::MultipleResponse.name,
                        inverse_of: :options

  has_many :answer_options, class_name: Course::Assessment::Answer::MultipleResponseOption.name,
                            inverse_of: :option, dependent: :destroy, foreign_key: :option_id

  default_scope { order(weight: :asc) }

  # @!method self.correct
  #   Gets the options which are marked as correct.
  scope :correct, ->() { where(correct: true) }

  def initialize_duplicate(duplicator, other)
    self.question = duplicator.duplicate(other.question)
  end
end
