# frozen_string_literal: true
class Course::Assessment::Answer::MultipleResponseOption < ApplicationRecord
  validates :answer, presence: true
  validates :option, presence: true
  validates :answer_id, uniqueness: { scope: [:option_id], allow_nil: true,
                                      if: -> { option_id? && answer_id_changed? } }
  validates :option_id, uniqueness: { scope: [:answer_id], allow_nil: true,
                                      if: -> { answer_id? && option_id_changed? } }

  belongs_to :answer, class_name: Course::Assessment::Answer::MultipleResponse.name,
                      inverse_of: :options
  belongs_to :option, class_name: Course::Assessment::Question::MultipleResponseOption.name,
                      inverse_of: :answer_options
end
