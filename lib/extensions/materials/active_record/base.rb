module Extensions::Materials::ActiveRecord::Base
  module ClassMethods
    # Declare this to allow models to support materials uploads.
    def has_one_folder # rubocop:disable Style/PredicateName
      has_one :folder, as: :owner, class_name: Course::Material::Folder.name,
                       inverse_of: :owner, dependent: :destroy, autosave: true
      has_many :materials, through: :folder, class_name: Course::Material.name

      define_method(:files_attributes=) do |files|
        folder.files_attributes = files
      end
    end
  end
end
