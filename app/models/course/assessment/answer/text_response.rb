class Course::Assessment::Answer::TextResponse < ActiveRecord::Base
  acts_as :answer, class_name: Course::Assessment::Answer.name, inverse_of: :actable

  after_initialize :set_default
  before_validation :strip_whitespace

  private

  def set_default
    self.answer_text ||= ''
  end

  def strip_whitespace
    answer_text.strip!
  end
end
