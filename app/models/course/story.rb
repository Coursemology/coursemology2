# frozen_string_literal: true
class Course::Story < ApplicationRecord
  acts_as_lesson_plan_item has_todo: true
  acts_as_conditional

  validates :provider_id, presence: true
  validates :creator, presence: true
  validates :updater, presence: true

  belongs_to :course, inverse_of: :stories

  has_many :rooms, inverse_of: :story, dependent: :destroy

  def to_partial_path
    'course/story/stories/story'
  end
end
