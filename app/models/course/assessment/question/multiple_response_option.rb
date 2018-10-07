# frozen_string_literal: true
class Course::Assessment::Question::MultipleResponseOption < ApplicationRecord
  validates_inclusion_of :correct, in: [true, false], :message=>:blank
  validates_presence_of :option
  validates_numericality_of :weight, allow_nil: true, only_integer: true,
                                     greater_than_or_equal_to: -2147483648, less_than: 2147483648
  validates_presence_of :weight
  validates_presence_of :question

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
