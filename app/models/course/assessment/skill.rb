# frozen_string_literal: true
class Course::Assessment::Skill < ApplicationRecord
  validate :validate_consistent_course
  validates :title, length: { maximum: 255 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :course, presence: true

  belongs_to :course, inverse_of: :assessment_skills
  belongs_to :skill_branch, class_name: Course::Assessment::SkillBranch.name, inverse_of: :skills, optional: true
  has_and_belongs_to_many :question_assessments, class_name: Course::QuestionAssessment.name

  # @!method self.order_by_title(direction = :asc)
  #   Orders the skills alphabetically by title.
  scope :order_by_title, ->(direction = :asc) { order(title: direction) }

  # @!attribute [r] total_grade
  #   Sum of grades from questions tagged with this skill.
  #   @return [Float]
  calculated :total_grade, (lambda do
    Course::Assessment::Question.select('coalesce(sum(maximum_grade), 0)').
      from(
        "course_assessment_questions caq \
        INNER JOIN course_question_assessments cqa ON \
        cqa.question_id = caq.id \
        INNER JOIN course_assessment_skills_question_assessments casqa ON \
        casqa.question_assessment_id = cqa.id \
        WHERE casqa.skill_id = course_assessment_skills.id"
      )
  end)

  def initialize_duplicate(duplicator, other)
    self.course = duplicator.options[:destination_course]
    self.skill_branch = duplicator.duplicated?(other.skill_branch) ? duplicator.duplicate(other.skill_branch) : nil
    question_assessments << other.question_assessments.select { |qa| duplicator.duplicated?(qa) }.
                            map { |qa| duplicator.duplicate(qa) }
  end

  private

  def validate_consistent_course
    return unless skill_branch

    errors.add(:course, :consistent_course) if course != skill_branch.course
  end
end
