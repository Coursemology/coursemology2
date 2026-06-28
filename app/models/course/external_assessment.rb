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
  has_one :gradebook_contribution, class_name: 'Course::Gradebook::ExternalContribution',
                                   inverse_of: :external_assessment, dependent: :destroy
  # delete_all (not destroy): grades carry no destroy callbacks, so destroying the
  # parent would otherwise fire one SELECT+DELETE per grade (N+1). delete_all removes
  # them in a single statement. Rails must issue it — the DB FK has no ON DELETE CASCADE.
  has_many :external_assessment_grades, class_name: 'Course::ExternalAssessmentGrade',
                                        inverse_of: :external_assessment, dependent: :delete_all

  scope :for_course, ->(course) { where(course_id: course.id) }

  before_create :assign_default_position

  # Next free position for the course (positions are 0-based, per course, not
  # required to be unique). Drives append-at-end for both manual add and import.
  def self.next_position(course)
    (for_course(course).maximum(:position) || -1) + 1
  end

  # Rewrites positions to match ordered_ids (the canonical gradebook order). The
  # id set must match the course's externals exactly, else the order would be
  # corrupted by a stale/partial payload.
  def self.reorder!(course:, ordered_ids:)
    scope = for_course(course)
    raise ArgumentError, 'ordered_ids must match the course externals' unless
      ordered_ids.map(&:to_i).sort == scope.pluck(:id).sort

    transaction do
      ordered_ids.each_with_index do |id, index|
        scope.where(id: id).update_all(position: index)
      end
    end
  end

  # The negative serialized id used by the synthetic tab AND the leaf assessment.
  def synthetic_tab_id
    -id
  end

  # Creates an external assessment and its gradebook contribution in one transaction.
  # Raises ActiveRecord::RecordInvalid on a duplicate title within the course.
  # rubocop:disable Metrics/ParameterLists -- factory mirrors the model's columns; named kwargs are clearer than a struct
  def self.create_for_course!(course:, title:, maximum_grade:, weight: 0,
                              floor_at_zero: true, cap_at_maximum: true)
    transaction do
      external = course.external_assessments.create!(
        title: title, maximum_grade: maximum_grade,
        floor_at_zero: floor_at_zero, cap_at_maximum: cap_at_maximum
      )
      Course::Gradebook::ExternalContribution.create!(course: course, external_assessment: external,
                                                      weight: weight)
      external
    end
  end
  # rubocop:enable Metrics/ParameterLists

  private

  def assign_default_position
    self.position ||= self.class.next_position(course)
  end
end
