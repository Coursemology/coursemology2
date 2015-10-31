class Course::Material::Folder < ActiveRecord::Base
  acts_as_forest order: :name, dependent: :destroy
  include Course::ModelComponentHost::Component

  after_initialize :set_defaults, if: :new_record?

  has_many :materials, inverse_of: :folder, dependent: :destroy, foreign_key: :folder_id,
                       class_name: Course::Material.name, autosave: true
  belongs_to :course, inverse_of: :material_folders
  belongs_to :owner, polymorphic: true, inverse_of: :folder

  validate :validate_name_is_unique_among_materials

  def files_attributes=(files)
    files.each do |file|
      materials.build(name: file.original_filename, file: file)
    end
  end

  def self.after_course_create(course)
    course.material_folders.create(name: 'Root')
  end

  private

  def set_defaults
    self.start_at ||= Time.zone.now
  end

  # TODO: Not threadsafe, consider making all folders as materials
  # Make sure that folder won't have the same name with other materials in the parent folder
  def validate_name_is_unique_among_materials
    return if parent.nil?

    conflicts = parent.materials.where('lower(name) = ?', name.downcase)
    errors.add(:name, :taken) if conflicts.any?
  end
end
