# frozen_string_literal: true
class Course::Material::Folder < ApplicationRecord
  acts_as_forest order: :name, dependent: :destroy
  include Course::ModelComponentHost::Component

  after_initialize :set_defaults, if: :new_record?
  before_validation :normalize_filename, if: :owner
  before_validation :assign_valid_name

  after_save :clear_duplication_flag

  has_many :materials, inverse_of: :folder, dependent: :destroy, foreign_key: :folder_id,
                       class_name: Course::Material.name, autosave: true
  belongs_to :course, inverse_of: :material_folders
  belongs_to :owner, polymorphic: true, inverse_of: :folder

  validate :validate_name_is_unique_among_materials
  validates_with FilenameValidator

  # @!attribute [r] material_count
  #   Returns the number of files in current folder.
  calculated :material_count, (lambda do
    Course::Material.select("count('*')").
      where('course_materials.folder_id = course_material_folders.id')
  end)

  # @!attribute [r] children_count
  #   Returns the number of subfolders in current folder.
  calculated :children_count, (lambda do
    select("count('*')").
      from('course_material_folders children').
      where('children.parent_id = course_material_folders.id')
  end)

  scope :with_content_statistics, ->() { all.calculated(:material_count, :children_count) }

  # Filter out the empty linked folders (i.e. Folder with an owner).
  def self.without_empty_linked_folder
    select do |folder|
      folder.concrete? || folder.children_count != 0 || folder.material_count != 0
    end
  end

  # Filter out folders with owners. Keeps folders created directly.
  # Needed for duplication.
  def self.concrete
    select(&:concrete?)
  end

  def self.after_course_initialize(course)
    return if course.persisted? || course.root_folder?

    course.material_folders.build(name: 'Root')
  end

  def build_materials(files)
    files.map do |file|
      materials.build(name: Pathname.normalize_filename(file.original_filename), file: file)
    end
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

  # Check if the folder is standalone and does not belongs to any owner(e.g. assessments).
  #
  # @return [Boolean]
  def concrete?
    owner_id.nil?
  end

  def initialize_duplicate(duplicator, other)
    # Do not shift the time of root folder
    self.start_at = other.parent_id.nil? ? Time.zone.now : duplicator.time_shift(other.start_at)
    self.end_at = duplicator.time_shift(other.end_at) if other.end_at
    self.updated_at = other.updated_at
    self.created_at = other.created_at
    self.materials = duplicator.duplicate(other.materials).compact
    self.owner = duplicator.duplicate(other.owner)
    self.course = duplicator.options[:target_course]
    initialize_duplicate_parent(duplicator, other)
    initialize_duplicate_children(duplicator, other)
    @duplicating = true
  end

  def initialize_duplicate_parent(duplicator, other)
    duplicating_course_root_folder = duplicator.mode == :course && other.parent.nil?
    self.parent = if duplicating_course_root_folder
                    nil
                  elsif duplicator.duplicated?(other.parent)
                    duplicator.duplicate(other.parent)
                  else
                    duplicator.options[:target_course].root_folder
                  end
  end

  def initialize_duplicate_children(duplicator, other)
    children << other.children.
                select { |folder| duplicator.duplicated?(folder) }.
                map { |folder| duplicator.duplicate(folder) }
  end

  private

  def set_defaults
    self.start_at ||= Time.zone.now
  end

  # TODO: Not threadsafe, consider making all folders as materials
  # Make sure that folder won't have the same name with other materials in the parent folder
  def validate_name_is_unique_among_materials
    return if parent.nil?

    conflicts = parent.materials.where.has { |parent| name =~ parent.name }
    errors.add(:name, :taken) unless conflicts.empty?
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
    return if owner_id.nil? && owner.nil?
    return if !name_changed? && !parent_id_changed?

    self.name = next_valid_name
  end

  # Normalize the folder name
  def normalize_filename
    self.name = Pathname.normalize_filename(name)
  end

  def clear_duplication_flag
    @duplicating = nil
  end

  # Return false to prevent the userstamp gem from changing the updater during duplication
  def record_userstamp
    !@duplicating
  end
end
