# frozen_string_literal: true
class Course::Material < ApplicationRecord
  has_one_attachment
  belongs_to :folder, inverse_of: :materials, class_name: Course::Material::Folder.name

  before_save :touch_folder
  after_save :clear_duplication_flag

  validate :validate_name_is_unique_among_folders
  validates_with FilenameValidator

  def touch_folder
    folder.touch if !@duplicating && changed?
  end

  # Returns the path of the material
  #
  # @return [Pathname] The path of the material
  def path
    folder.path + name
  end

  # Return false to prevent the userstamp gem from changing the updater during duplication
  def record_userstamp
    !@duplicating
  end

  def initialize_duplicate(duplicator, other)
    self.attachment = duplicator.duplicate(other.attachment)
    self.folder = duplicator.duplicate(other.folder)
    self.updated_at = other.updated_at
    self.created_at = other.created_at
    @duplicating = true
  end

  private

  # TODO: Not threadsafe, consider making all folders as materials
  # Make sure that material won't have the same name with other child folders in the folder
  def validate_name_is_unique_among_folders
    return if folder.nil?

    conflicts = folder.children.where.has { |parent| name =~ parent.name }
    errors.add(:name, :taken) unless conflicts.empty?
  end

  def clear_duplication_flag
    @duplicating = nil
  end
end
