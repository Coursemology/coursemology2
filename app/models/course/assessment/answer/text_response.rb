# frozen_string_literal: true
class Course::Assessment::Answer::TextResponse < ActiveRecord::Base
  acts_as :answer, class_name: Course::Assessment::Answer.name
  has_one_attachment

  after_initialize :set_default
  before_validation :strip_whitespace

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.answer_text = ''
    save
    acting_as
  end

  private

  def set_default
    self.answer_text ||= ''
  end

  def strip_whitespace
    answer_text.strip!
  end
end
