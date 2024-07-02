# frozen_string_literal: true
class Course::Assessment::Answer::VoiceResponse < ApplicationRecord
  acts_as :answer, class_name: 'Course::Assessment::Answer'
  has_one_attachment

  def assign_params(params)
    acting_as.assign_params(params)
    self.file = params[:file] if params[:file]
  end

  def compare_answer(other_answer)
    return false unless other_answer.is_a?(Course::Assessment::Answer::VoiceResponse)

    (attachment&.name == other_answer.attachment&.name) &&
      (attachment&.attachment_id == other_answer.attachment&.attachment_id)
  end
end
