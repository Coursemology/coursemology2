# frozen_string_literal: true
class Course::Assessment::Tab < ApplicationRecord
  validates_length_of :title, allow_nil: true, maximum: 255
  validates_presence_of :title
  validates_numericality_of :weight, allow_nil: true, only_integer: true, greater_than_or_equal_to: -2147483648, less_than: 2147483648
  validates_presence_of :weight
  validates_presence_of :creator
  validates_presence_of :updater
  validates_presence_of :category

  belongs_to :category, class_name: Course::Assessment::Category.name, inverse_of: :tabs
  has_many :assessments, class_name: Course::Assessment.name, dependent: :destroy, inverse_of: :tab
  has_many :folders, class_name: Course::Material::Folder.name, through: :assessments,
                     inverse_of: nil

  before_save :reassign_folders, if: :category_id_changed?
  before_destroy :validate_before_destroy

  default_scope { order(:weight) }

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
