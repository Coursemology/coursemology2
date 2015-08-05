class Course::Material::Folder < ActiveRecord::Base
  belongs_to :parent_folder, inverse_of: :subfolders, class_name: Course::Material::Folder.name
  has_many :subfolders, inverse_of: :parent_folder, dependent: :destroy,
                        foreign_key: :parent_folder_id, class_name: Course::Material::Folder.name
  has_many :materials, inverse_of: :folder, dependent: :destroy, foreign_key: :folder_id,
                       class_name: Course::Material.name
end
