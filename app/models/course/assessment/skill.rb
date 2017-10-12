# frozen_string_literal: true
class Course::Assessment::Skill < ApplicationRecord
  belongs_to :course, inverse_of: :assessment_skills
  belongs_to :skill_branch, class_name: Course::Assessment::SkillBranch.name, inverse_of: :skills
  has_and_belongs_to_many :questions, class_name: Course::Assessment::Question.name

  validate :validate_consistent_course

  # @!method self.order_by_title(direction = :asc)
  #   Orders the skills alphabetically by title.
  scope :order_by_title, ->(direction = :asc) { order(title: direction) }

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:target_course]
    self.skill_branch = duplicator.duplicated?(other.skill_branch) ? duplicator.duplicate(other.skill_branch) : nil
    questions << other.questions.map(&:actable).
                 select { |question| duplicator.duplicated?(question) }.
                 map { |question| duplicator.duplicate(question).acting_as }
  end

  private

  def validate_consistent_course
    return unless skill_branch

    errors.add(:course, :consistent_course) if course != skill_branch.course
  end
end
