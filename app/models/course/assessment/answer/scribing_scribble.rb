# frozen_string_literal: true
class Course::Assessment::Answer::ScribingScribble < ApplicationRecord
  validates_presence_of :creator

  belongs_to :answer, class_name: Course::Assessment::Answer::Scribing.name, inverse_of: :scribbles
end
