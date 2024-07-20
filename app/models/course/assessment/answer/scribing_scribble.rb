# frozen_string_literal: true
class Course::Assessment::Answer::ScribingScribble < ApplicationRecord
  validates :creator, presence: true
  validates :answer, presence: true

  belongs_to :answer, class_name: 'Course::Assessment::Answer::Scribing', inverse_of: :scribbles
end
