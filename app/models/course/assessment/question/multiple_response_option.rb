# frozen_string_literal: true
class Course::Assessment::Question::MultipleResponseOption < ActiveRecord::Base
  belongs_to :question, class_name: Course::Assessment::Question::MultipleResponse.name,
                        inverse_of: :options

  # @!method self.correct
  #   Gets the options which are marked as correct.
  scope :correct, ->() { where(correct: true) }
end
