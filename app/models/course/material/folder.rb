class Course::Material::Folder < ActiveRecord::Base
  acts_as_forest order: 'name'

  after_initialize :set_defaults, if: :new_record?

  has_many :materials, inverse_of: :folder, dependent: :destroy, foreign_key: :folder_id,
                       class_name: Course::Material.name
  belongs_to :course, inverse_of: :material_folders

  # TODO: Remove this after schema_validations #21 was closed
  validates :name, uniqueness: { case_sensitive: false, scope: :parent_id }, if: :parent

  private

  def set_defaults
    self.start_at ||= Time.zone.now
  end
end
