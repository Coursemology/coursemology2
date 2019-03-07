# frozen_string_literal: true
class Course::Assessment::SkillBranch < ApplicationRecord
  validates :title, length: { maximum: 255 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :course, presence: true

  belongs_to :course, inverse_of: :assessment_skill_branches
  has_many :skills, inverse_of: :skill_branch, dependent: :destroy

  scope :ordered_by_title, -> { order(:title) }

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:destination_course]
    skills << other.skills.
              select { |skill| duplicator.duplicated?(skill) }.
              map { |skill| duplicator.duplicate(skill) }
  end
end
