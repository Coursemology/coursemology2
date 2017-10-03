# frozen_string_literal: true
class Course::Assessment::Answer::VoiceResponse < ActiveRecord::Base
  acts_as :answer, class_name: Course::Assessment::Answer.name
  has_one_attachment

  def assign_params(params)
    acting_as.assign_params(params)
    self.file = params[:file] if params[:file]
  end
end
