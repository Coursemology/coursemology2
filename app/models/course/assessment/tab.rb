# frozen_string_literal: true
class Course::Assessment::Tab < ApplicationRecord
  validates :title, length: { maximum: 255 }, presence: true
  validates :weight, numericality: { only_integer: true }, presence: true
  validates :gradebook_weight,
            numericality: { greater_than_or_equal_to: 0,
                            less_than_or_equal_to: 100 },
            presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :category, presence: true

  belongs_to :category, class_name: 'Course::Assessment::Category', inverse_of: :tabs
  has_many :assessments, class_name: 'Course::Assessment', dependent: :destroy, inverse_of: :tab

  enum :weight_mode, { equal: 0, custom: 1 }
  has_many :folders, class_name: 'Course::Material::Folder', through: :assessments,
                     inverse_of: nil

  before_save :reassign_folders, if: :category_id_changed?
  before_destroy :validate_before_destroy

  default_scope { order(:weight) }

  calculated :top_assessment_titles, (lambda do
    Course::Assessment.
      where('course_assessments.tab_id = course_assessment_tabs.id').
      joins('INNER JOIN course_lesson_plan_items ON course_assessments.id = actable_id').
      limit(3).
      select('(array_agg(title))[0:3]')
  end)

  # Bulk-updates gradebook weights, weight modes, and per-assessment weights for a set
  # of tabs belonging to the given course.
  # Raises ActiveRecord::RecordNotFound if any tab_id or assessment_id is unknown.
  # Raises ActiveRecord::RecordInvalid if validation fails or, for custom tabs, the
  # assessment weights do not sum (at 2dp) to the tab total; the transaction is rolled back.
  #
  # @param course [Course]
  # @param updates [Array<Hash>] each { tab_id:, weight:, weight_mode:,
  #   assessment_weights: [{ assessment_id:, weight: }] }
  def self.update_gradebook_weights(course:, updates:)
    course_tab_ids = course.assessment_tabs.pluck(:id).to_set
    updates.each { |e| raise ActiveRecord::RecordNotFound unless course_tab_ids.include?(e[:tab_id]) }

    tabs_by_id = where(id: updates.map { |e| e[:tab_id] }).includes(:assessments).index_by(&:id)

    transaction { updates.each { |entry| apply_gradebook_weight_entry(tabs_by_id, entry) } }
  end

  # @api private
  def self.apply_gradebook_weight_entry(tabs_by_id, entry)
    tab = tabs_by_id[entry[:tab_id]]
    mode = (entry[:weight_mode] || 'equal').to_s
    tab.update!(gradebook_weight: entry[:weight], weight_mode: mode)

    if mode == 'custom'
      apply_custom_assessment_weights(tab, entry)
    else
      tab.assessments.update_all(gradebook_weight: nil)
    end
  end
  private_class_method :apply_gradebook_weight_entry

  # @api private
  def self.apply_custom_assessment_weights(tab, entry) # rubocop:disable Metrics/AbcSize
    assessments_by_id = tab.assessments.index_by(&:id)
    sum = (entry[:assessment_weights] || []).sum do |aw|
      assessment = assessments_by_id[aw[:assessment_id]]
      raise ActiveRecord::RecordNotFound if assessment.nil?

      assessment.update!(gradebook_weight: aw[:weight])
      aw[:weight]
    end
    return unless (sum * 100).round != (entry[:weight] * 100).round

    tab.errors.add(:base, :custom_weights_mismatch)
    raise ActiveRecord::RecordInvalid, tab
  end
  private_class_method :apply_custom_assessment_weights

  # Returns a boolean value indicating if there are other tabs
  # besides this one remaining in its category.
  #
  # @return [Boolean]
  def other_tabs_remaining?
    category.tabs.count > 1
  end

  def initialize_duplicate(duplicator, other)
    self.category = if duplicator.duplicated?(other.category)
                      duplicator.duplicate(other.category)
                    else
                      duplicator.options[:destination_course].assessment_categories.first
                    end
    assessments <<
      other.assessments.select { |assessment| duplicator.duplicated?(assessment) }.map do |assessment|
        duplicator.duplicate(assessment).tap do |duplicate_assessment|
          duplicate_assessment.folder.parent = category.folder
        end
      end
  end

  private

  def validate_before_destroy
    return true if category.destroying? || other_tabs_remaining?

    errors.add(:base, :deletion)
    throw(:abort)
  end

  # Reassign the assessment folders to new category if the category changed.
  def reassign_folders
    # Category association might not be updated when category_id changed
    new_parent_folder = Course::Assessment::Category.find(category_id).folder

    folders.each do |folder|
      folder.parent = new_parent_folder
      throw(:abort) unless folder.save
    end
  end
end
