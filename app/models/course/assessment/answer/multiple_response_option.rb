# frozen_string_literal: true
class Course::Assessment::Answer::MultipleResponseOption < ApplicationRecord
  validates_presence_of :answer
  validates_presence_of :option
  validates_uniqueness_of :answer_id, scope: [:option_id], allow_nil: true,
                                      if: -> { option_id? && answer_id_changed? }
  validates_uniqueness_of :option_id, scope: [:answer_id], allow_nil: true,
                                      if: -> { answer_id? && option_id_changed? }

  belongs_to :answer, class_name: Course::Assessment::Answer::MultipleResponse.name,
                      inverse_of: :options
  belongs_to :option, class_name: Course::Assessment::Question::MultipleResponseOption.name,
                      inverse_of: :answer_options
end
