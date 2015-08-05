class Course::Material < ActiveRecord::Base
  acts_as_attachable
  belongs_to :folder, inverse_of: :materials, class_name: Course::Material::Folder.name
end
