class Course::Material < ActiveRecord::Base
  has_one_attachment
  belongs_to :folder, inverse_of: :materials, class_name: Course::Material::Folder.name
end
