# frozen_string_literal: true
class Course::Survey::Answer::TextResponse < ActiveRecord::Base
  acts_as :answer, class_name: Course::Survey::Answer.name
end
