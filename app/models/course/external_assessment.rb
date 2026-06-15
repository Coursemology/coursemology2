# frozen_string_literal: true
# A gradebook component graded outside Coursemology (e.g. a midterm or final).
# It is a first-class gradebook contributor, NOT a Course::Assessment: it never
# touches attempts, EXP, statistics, todos, or the lesson plan. Its weight lives on
# its course_gradebook_contributions row; its display grouping is synthesised by the
# gradebook serializer (no real tab/category exists).
class Course::ExternalAssessment < ApplicationRecord
  # Sentinel id for the serializer's synthetic "External Assessments" category.
  # Native categories are positive; externals and their synthetic grouping are negative.
  SYNTHETIC_CATEGORY_ID = -1
  SYNTHETIC_CATEGORY_TITLE = 'External Assessments'

  validates :title, length: { maximum: 255 }, presence: true
  validates :title, uniqueness: { scope: :course_id }
  validates :maximum_grade, presence: true
  validates :maximum_grade, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :creator, presence: true
  validates :updater, presence: true

  belongs_to :course, inverse_of: :external_assessments
  has_one :gradebook_contribution, class_name: 'Course::Gradebook::Contribution',
                                   inverse_of: :external_assessment, dependent: :destroy
  has_many :external_assessment_grades, class_name: 'Course::ExternalAssessmentGrade',
                                        inverse_of: :external_assessment, dependent: :destroy

  scope :for_course, ->(course) { where(course_id: course.id) }

  # The negative serialized id used by the synthetic tab AND the leaf assessment.
  def synthetic_tab_id
    -id
  end

  # Creates an external assessment and its gradebook contribution in one transaction.
  # Raises ActiveRecord::RecordInvalid on a duplicate title within the course.
  def self.create_for_course!(course:, title:, maximum_grade:, weight: 0)
    transaction do
      external = course.external_assessments.create!(title: title, maximum_grade: maximum_grade)
      Course::Gradebook::Contribution.create!(course: course, external_assessment: external,
                                              weight: weight, weight_mode: 'equal', keep_highest: 0)
      external
    end
  end
end
