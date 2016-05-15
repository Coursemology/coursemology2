# frozen_string_literal: true
class Course::Survey::Question::TextResponse < ActiveRecord::Base
  acts_as :question, class_name: Course::Survey::Question.name
end
