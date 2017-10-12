# frozen_string_literal: true
class Course::Assessment::Answer::Scribing < ApplicationRecord
  acts_as :answer, class_name: Course::Assessment::Answer.name
  has_many :scribbles, class_name: Course::Assessment::Answer::ScribingScribble.name,
                       dependent: :destroy, foreign_key: :answer_id, inverse_of: :answer

  accepts_nested_attributes_for :scribbles, allow_destroy: true

  def to_partial_path
    'course/assessment/answer/scribing/scribing'
  end

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.class.transaction do
      scribbles.clear
      raise ActiveRecord::Rollback unless save
    end
    acting_as
  end
end
