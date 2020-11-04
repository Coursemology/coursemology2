# frozen_string_literal: true
class Course::Material::Folder < ApplicationRecord
  acts_as_forest order: :name, dependent: :destroy, optional: true
  include Course::ModelComponentHost::Component
  include DuplicationStateTrackingConcern

  after_initialize :set_defaults, if: :new_record?
  before_validation :normalize_filename, if: :owner
  before_validation :assign_valid_name

  has_many :materials, inverse_of: :folder, dependent: :destroy, foreign_key: :folder_id,
                       class_name: Course::Material.name, autosave: true
  belongs_to :course, inverse_of: :material_folders
  belongs_to :owner, polymorphic: true, inverse_of: :folder, optional: true

  validate :validate_name_is_unique_among_materials
  validates_with FilenameValidator
  validates :owner_type, length: { maximum: 255 }, allow_nil: true
  validates :name, length: { maximum: 255 }, presence: true
  validates :start_at, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :can_student_upload, inclusion: { in: [true, false] }
  validates :course, presence: true
  validates :name, uniqueness: { scope: [:parent_id],
                                 case_sensitive: false, if: -> { parent_id? && name_changed? } }
  validates :parent_id, uniqueness: { scope: [:name], allow_nil: true,
                                      case_sensitive: false, if: -> { name? && parent_id_changed? } }
  validates :owner_type, uniqueness: { scope: [:owner_id], allow_nil: true,
                                       if: -> { owner_id? && owner_type_changed? } }
  validates :owner_id, uniqueness: { scope: [:owner_type], allow_nil: true,
                                     if: -> { owner_type? && owner_id_changed? } }

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
  scope :concrete, ->() { where(owner_id: nil) }
  scope :root, ->() { where(parent_id: nil) }

  # Filter out the empty linked folders (i.e. Folder with an owner).
  def self.without_empty_linked_folder
    select do |folder|
      folder.concrete? || folder.children_count != 0 || folder.material_count != 0
    end
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

  # Finds a unique name for `item` among the folder's existing contents by appending a serial number
  # to it, if necessary. E.g. "logo.png" will be named "logo.png (1)" if the files named "logo.png"
  # and "logo.png (0)" exist in the folder.
  #
  # @param [#name] item Folder or Material to find unique name for.
  # @return [String] A unique name.
  def next_uniq_child_name(item)
    taken_names = contents_names(item).map(&:downcase)
    name_generator = FileName.new(item.name, path: :relative, add: :always,
                                             format: '(%d)', delimiter: ' ')
    new_name = item.name
    new_name = name_generator.create while taken_names.include?(new_name.downcase)
    new_name
  end

  # Finds a unique name for the current folder among its siblings.
  #
  # @return [String] A unique name.
  def next_valid_name
    parent.next_uniq_child_name(self)
  end

  # Take Course#advance_start_at_duration into account when calculating folder's start datetime.
  #
  # @return [DateTime] The shifted start_at datetime.
  def effective_start_at
    start_at - course&.advance_start_at_duration
  end

  def initialize_duplicate(duplicator, other)
    # Do not shift the time of root folder
    self.start_at = other.parent_id.nil? ? Time.zone.now : duplicator.time_shift(other.start_at)
    self.end_at = duplicator.time_shift(other.end_at) if other.end_at
    self.updated_at = other.updated_at
    self.created_at = other.created_at
    self.owner = duplicator.duplicate(other.owner)
    self.course = duplicator.options[:destination_course]
    initialize_duplicate_parent(duplicator, other)
    initialize_duplicate_children(duplicator, other)
    set_duplication_flag
    initialize_duplicate_materials(duplicator, other)
  end

  def initialize_duplicate_parent(duplicator, other)
    duplicating_course_root_folder = duplicator.mode == :course && other.parent.nil?
    self.parent = if duplicating_course_root_folder
                    nil
                  elsif duplicator.duplicated?(other.parent)
                    duplicator.duplicate(other.parent)
                  else
                    # If parent has not been duplicated yet, put the current duplicate under the root folder
                    # temporarily. The folder will be re-parented only afterwards when the parent is being
                    # duplicated. This will be done when `#initialize_duplicate_children` is called on the
                    # duplicated parent folder.
                    #
                    # If the folder's parent is not selected for duplication, the current duplicated folder
                    # will remain a child of the root folder.
                    duplicator.options[:destination_course].root_folder
                  end
  end

  def initialize_duplicate_children(duplicator, other)
    # Add only subfolders that have already been duplicated as its children.
    # If a subfolder has been selected for duplication, but has not yet been duplicated,
    # then the subfolder's duplicate will be added as a child of the current folder later on when
    # the child is being duplicated and `initialize_duplicate_parent` is being called on the duplicated
    # child folder. `duplicator.duplicate(folder)` will merely retrieve the subfolder's duplicate,
    # rather than trigger the duplication of the subfolder.
    children << other.children.
                select { |folder| duplicator.duplicated?(folder) }.
                map { |folder| duplicator.duplicate(folder) }
  end

  def initialize_duplicate_materials(duplicator, other)
    self.materials = if other.concrete?
                       # Create associations only for materials which have been duplicated. For child materials
                       # that are duplicated later, the duplicated material will parent itself under the
                       # current folder. (see `Course::Material#initialize_duplicate`)
                       other.materials.
                         select { |material| duplicator.duplicated?(material) }.
                         map { |material| duplicator.duplicate(material) }
                     else
                       # If folder is virtual, all it's materials are duplicated by default.
                       duplicator.duplicate(other.materials).compact
                     end
  end

  def before_duplicate_save(_duplicator)
    self.name = next_valid_name
  end

  private

  def set_defaults
    self.start_at ||= Time.zone.now
  end

  # TODO: Not threadsafe, consider making all folders as materials
  # Make sure that folder won't have the same name with other materials in the parent folder
  # Schema validations already ensure that it won't have the same name as other folders
  def validate_name_is_unique_among_materials
    return if parent.nil?

    # conflicts = parent.materials.where.has { |parent| name =~ parent.name }
    conflicts = parent.materials.where(Course::Material.arel_table[:name] =~ name)
    errors.add(:name, :taken) unless conflicts.empty?
  end

  # Fetches the names of the contents of the current folder, except for an excluded_item, if one is
  # provided.
  #
  # @param [Object] excluded_item Item whose name to exclude from the list
  # @return [Array<String>] List of names of contents of folder
  def contents_names(excluded_item = nil)
    excluded_material = excluded_item.class == Course::Material ? excluded_item : nil
    excluded_folder = excluded_item.class == Course::Material::Folder ? excluded_item : nil
    materials_names = materials.where.not(id: excluded_material).pluck(:name)
    subfolders_names = children.where.not(id: excluded_folder).pluck(:name)
    materials_names + subfolders_names
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

  # Return false to prevent the userstamp gem from changing the updater during duplication
  def record_userstamp
    !duplicating?
  end
end
