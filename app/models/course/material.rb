# frozen_string_literal: true
class Course::Material < ApplicationRecord
  acts_as_conditional
  has_one_attachment
  include DuplicationStateTrackingConcern

  belongs_to :folder, inverse_of: :materials, class_name: Course::Material::Folder.name

  has_many :downloads
  has_many :course_users, through: :downloads
  has_many :material_conditions, class_name: Course::Condition::Material.name,
                                 inverse_of: :material, dependent: :destroy

  before_create :set_course_id
  before_save :touch_folder

  validate :validate_name_is_unique_among_folders
  validates_with FilenameValidator
  validates :name, length: { maximum: 255 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :folder, presence: true
  validates :name, uniqueness: { scope: [:folder_id], case_sensitive: false,
                                 if: -> { folder_id? && name_changed? } }
  validates :folder_id, uniqueness: { scope: [:name], case_sensitive: false,
                                      if: -> { name? && folder_id_changed? } }

  scope :in_concrete_folder, -> { joins(:folder).merge(Folder.concrete) }

  def touch_folder
    folder.touch if !duplicating? && changed?
  end

  # Returns the path of the material
  #
  # @return [Pathname] The path of the material
  def path
    folder.path + name
  end

  # Return false to prevent the userstamp gem from changing the updater during duplication
  def record_userstamp
    !duplicating?
  end

  # Finds a unique name for the current material among its siblings.
  #
  # @return [String] A unique name.
  def next_valid_name
    folder.next_uniq_child_name(self)
  end

  def initialize_duplicate(duplicator, other)
    self.attachment = duplicator.duplicate(other.attachment)
    self.folder = if duplicator.duplicated?(other.folder)
                    duplicator.duplicate(other.folder)
                  else
                    # If parent has not been duplicated yet, put the current duplicate under the root folder
                    # temorarily. The material will be re-parented only afterwards when the parent folder is being
                    # duplicated. This will be done when `#initialize_duplicate_children` is called on the
                    # duplicated parent folder.
                    #
                    # If the material's folder is not selected for duplication, the current duplicated material will
                    # remain a child of the root folder.
                    duplicator.options[:destination_course].root_folder
                  end
    initialize_duplicate_conditions(duplicator, other)
    self.updated_at = other.updated_at
    self.created_at = other.created_at
    set_duplication_flag
  end

  def before_duplicate_save(_duplicator)
    self.name = next_valid_name
  end

  def permitted_for!(_course_user)
  end

  def precluded_for!(_course_user)
  end

  def satisfiable?
    true
  end

  private

  def set_course_id
    self.course_id = folder.course_id
  end

  # TODO: Not threadsafe, consider making all folders as materials
  # Make sure that material won't have the same name with other child folders in the folder
  # Schema validations already ensure that it won't have the same name as other materials
  def validate_name_is_unique_among_folders
    return if folder.nil?

    conflicts = folder.children.where('name ILIKE ?', name)
    errors.add(:name, :taken) unless conflicts.empty?
  end

  # Set up conditions that depend on this material and conditions that this material depends on.
  def initialize_duplicate_conditions(duplicator, other)
    duplicate_conditions(duplicator, other)
    material_conditions << other.material_conditions.
                           select { |condition| duplicator.duplicated?(condition.conditional) }.
                           map { |condition| duplicator.duplicate(condition) }
  end
end
