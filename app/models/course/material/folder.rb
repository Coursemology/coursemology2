# frozen_string_literal: true
class Course::Material::Folder < ActiveRecord::Base
  acts_as_forest order: :name, dependent: :destroy
  include Course::ModelComponentHost::Component

  after_initialize :set_defaults, if: :new_record?
  before_validation :normalize_filename, if: :owner
  before_validation :assign_valid_name

  has_many :materials, inverse_of: :folder, dependent: :destroy, foreign_key: :folder_id,
                       class_name: Course::Material.name, autosave: true
  belongs_to :course, inverse_of: :material_folders
  belongs_to :owner, polymorphic: true, inverse_of: :folder

  validate :validate_name_is_unique_among_materials
  validates_with FilenameValidator

  def files_attributes=(files)
    files.each do |file|
      materials.build(name: Pathname.normalize_filename(file.original_filename), file: file)
    end
  end

  def self.after_course_initialize(course)
    return if course.persisted? || course.root_folder?

    course.material_folders.build(name: 'Root')
  end

  # Returns the path of the folder, note that '/' will be returned for root_folder
  #
  # @return [Pathname] The path of the folder
  def path
    folders = ancestors.reverse + [self]
    folders.shift # Remove the root folder
    path = File.join('/', folders.map(&:name))
    Pathname.new(path)
  end

  private

  def set_defaults
    self.start_at ||= Time.zone.now
  end

  # TODO: Not threadsafe, consider making all folders as materials
  # Make sure that folder won't have the same name with other materials in the parent folder
  def validate_name_is_unique_among_materials
    return if parent.nil?

    conflicts = parent.materials.where { name =~ my { name } }
    errors.add(:name, :taken) if conflicts.any?
  end

  def sibling_names
    parent.children.where.not(id: self).pluck(:name) + parent.materials.pluck(:name)
  end

  # Find the next valid name whose format is based on the the name given.
  # If the base_name has been taken, the next name will be generate in the format of: base_name(0),
  # base_name(1), etc.
  # @param [String] base_name The name which we want to name the folder.
  # @return [String] The next valid name that haven't been taken.
  def next_valid_name(base_name = name)
    return base_name unless parent && base_name

    names_taken = sibling_names.map(&:downcase)
    name_generator = FileName.new(base_name, path: :relative, add: :always,
                                             format: '(%d)', delimiter: ' ')

    new_name = base_name
    new_name = name_generator.create while names_taken.include?(new_name.downcase)

    new_name
  end

  def assign_valid_name
    return unless name_changed? && owner

    self.name = next_valid_name
  end

  # Normalize the folder name
  def normalize_filename
    self.name = Pathname.normalize_filename(name)
  end
end
