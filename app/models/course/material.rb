# frozen_string_literal: true
class Course::Material < ActiveRecord::Base
  has_one_attachment
  belongs_to :folder, inverse_of: :materials, class_name: Course::Material::Folder.name, touch: true

  validate :validate_name_is_unique_among_folders
  validates_with FilenameValidator

  # Returns the path of the material
  #
  # @return [Pathname] The path of the material
  def path
    folder.path + name
  end

  private

  # TODO: Not threadsafe, consider making all folders as materials
  # Make sure that material won't have the same name with other child folders in the folder
  def validate_name_is_unique_among_folders
    return if folder.nil?

    conflicts = folder.children.where { name =~ my { name } }
    errors.add(:name, :taken) unless conflicts.empty?
  end
end
