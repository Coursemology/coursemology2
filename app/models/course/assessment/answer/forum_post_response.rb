# frozen_string_literal: true
class Course::Assessment::Answer::ForumPostResponse < ApplicationRecord
  acts_as :answer, class_name: Course::Assessment::Answer.name

  def assign_params(params)
    acting_as.assign_params(params)
  end
end
