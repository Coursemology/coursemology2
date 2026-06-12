# frozen_string_literal: true
class Course::Gradebook::TabContribution < ApplicationRecord
  # `prefix: true` keeps Rails from generating a bare `equal?` predicate that would
  # override Ruby's Object#equal? (identity, arity 1). Helpers become
  # `weight_mode_equal?` etc.; the `weight_mode` reader still returns 'equal'/'custom'.
  enum :weight_mode, { equal: 0, custom: 1 }, prefix: true

  belongs_to :course, inverse_of: :gradebook_contributions
  belongs_to :tab, class_name: 'Course::Assessment::Tab',
                   inverse_of: :gradebook_contribution

  validates :creator, presence: true
  validates :updater, presence: true
  validates :weight, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :weight_mode, presence: true
  validates :tab_id, uniqueness: true
  validate :course_matches_contributor
  # Bulk-upserts tab contributions and their per-assessment contributions for a course.
  # Consumes the identical `updates` payload the controller parses today.
  # Raises ActiveRecord::RecordNotFound if any tab_id/assessment_id is unknown, and
  # ActiveRecord::RecordInvalid if validation fails or, for custom tabs, the included
  # assessment weights do not sum (at 2dp) to the tab total; the transaction rolls back.
  #
  # @param course [Course]
  # @param updates [Array<Hash>] each { tab_id:, weight:, weight_mode:,
  #   excluded_assessment_ids: [Integer], assessment_weights: [{ assessment_id:, weight: }] }
  def self.bulk_update(course:, updates:)
    course_tab_ids = course.assessment_tabs.pluck(:id).to_set
    updates.each { |e| raise ActiveRecord::RecordNotFound unless course_tab_ids.include?(e[:tab_id]) }

    tabs_by_id = Course::Assessment::Tab.where(id: updates.map { |e| e[:tab_id] }).
                 includes(:assessments).index_by(&:id)

    transaction { updates.each { |entry| apply_entry(course, tabs_by_id, entry) } }
  end

  # @api private
  def self.apply_entry(course, tabs_by_id, entry)
    tab = tabs_by_id[entry[:tab_id]]
    mode = (entry[:weight_mode] || 'equal').to_s

    contribution = find_or_initialize_by(tab_id: tab.id)
    contribution.course = course
    contribution.assign_attributes(weight: entry[:weight], weight_mode: mode)
    contribution.save!

    excluded_ids = entry[:excluded_assessment_ids] || []
    apply_assessment_exclusions(tab, excluded_ids)

    if mode == 'custom'
      apply_custom_assessment_weights(tab, entry, excluded_ids.to_set)
    else
      clear_assessment_weights(tab)
    end
  end
  private_class_method :apply_entry

  # @api private
  def self.assessment_contribution_for(assessment)
    Course::Gradebook::AssessmentContribution.find_or_initialize_by(assessment_id: assessment.id)
  end
  private_class_method :assessment_contribution_for

  # @api private
  # Membership applies in both modes: excluded ids -> true, the rest of the tab -> false.
  def self.apply_assessment_exclusions(tab, excluded_ids)
    excluded_set = excluded_ids.to_set
    tab.assessments.each do |assessment|
      ac = assessment_contribution_for(assessment)
      ac.excluded = excluded_set.include?(assessment.id)
      ac.save!
    end
  end
  private_class_method :apply_assessment_exclusions

  # @api private
  def self.clear_assessment_weights(tab)
    tab.assessments.each do |assessment|
      ac = assessment_contribution_for(assessment)
      ac.weight = nil
      ac.save!
    end
  end
  private_class_method :clear_assessment_weights

  # @api private
  def self.apply_custom_assessment_weights(tab, entry, excluded_ids)
    assessments_by_id = tab.assessments.index_by(&:id)
    included_sum = 0
    included_any = false
    (entry[:assessment_weights] || []).each do |aw|
      assessment = assessments_by_id[aw[:assessment_id]]
      raise ActiveRecord::RecordNotFound if assessment.nil?

      ac = assessment_contribution_for(assessment)
      ac.weight = aw[:weight]
      ac.save!
      next if excluded_ids.include?(aw[:assessment_id])

      included_sum += aw[:weight]
      included_any = true
    end
    validate_custom_assessment_weights_sum!(tab, entry, included_sum, included_any)
  end
  private_class_method :apply_custom_assessment_weights

  def self.validate_custom_assessment_weights_sum!(tab, entry, included_sum, included_any)
    return unless included_any
    return unless (included_sum * 100).round != (entry[:weight] * 100).round

    tab.errors.add(:base, :custom_weights_mismatch)
    raise ActiveRecord::RecordInvalid, tab
  end

  private

  def course_matches_contributor
    return if tab.nil? || course.nil?

    errors.add(:course, :invalid) if tab.category.course_id != course_id
  end
end
