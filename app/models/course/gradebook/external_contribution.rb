# frozen_string_literal: true
class Course::Gradebook::ExternalContribution < ApplicationRecord
  belongs_to :course, inverse_of: :gradebook_external_contributions
  belongs_to :external_assessment, class_name: 'Course::ExternalAssessment',
                                   inverse_of: :gradebook_contribution

  validates :creator, presence: true
  validates :updater, presence: true
  validates :weight, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :external_assessment_id, uniqueness: true
  validate :course_matches_external_assessment

  # Upserts one external-assessment contribution per entry. Entries arrive with the gradebook's
  # negative-tab_id wire encoding (tab_id == -external_assessment_id), shared with the tab payload.
  # Raises ActiveRecord::RecordNotFound for an unknown/foreign external, ActiveRecord::RecordInvalid
  # on an out-of-range weight; the transaction rolls back.
  #
  # @param course [Course]
  # @param updates [Array<Hash>] each { tab_id: (negative external id), weight: }
  def self.bulk_update(course:, updates:)
    externals_by_id = course.external_assessments.
                      where(id: updates.map { |e| -e[:tab_id] }).index_by(&:id)
    updates.each { |e| raise ActiveRecord::RecordNotFound unless externals_by_id.key?(-e[:tab_id]) }

    transaction do
      updates.each { |entry| upsert(course, externals_by_id[-entry[:tab_id]], entry[:weight]) }
    end
  end

  # Upserts a single contribution for the given external assessment.
  def self.upsert(course, external, weight)
    contribution = find_or_initialize_by(external_assessment_id: external.id)
    contribution.course = course
    contribution.weight = weight
    contribution.save!
  end
  private_class_method :upsert

  private

  def course_matches_external_assessment
    return if external_assessment.nil? || course.nil?

    errors.add(:course, :invalid) if external_assessment.course_id != course_id
  end
end
