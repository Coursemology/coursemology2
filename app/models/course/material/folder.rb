class Course::Material::Folder < ActiveRecord::Base
  acts_as_forest order: :name, dependent: :destroy
  include Course::ModelComponentHost::Component

  after_initialize :set_defaults, if: :new_record?

  has_many :materials, inverse_of: :folder, dependent: :destroy, foreign_key: :folder_id,
                       class_name: Course::Material.name, autosave: true
  belongs_to :course, inverse_of: :material_folders
  belongs_to :owner, polymorphic: true, inverse_of: :folder

  # TODO: Remove this after schema_validations #21 was closed
  validates :name, uniqueness: { case_sensitive: false, scope: :parent_id }, if: :parent

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
end
