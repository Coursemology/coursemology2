# frozen_string_literal: true
module Extensions::Materials::ActiveRecord::Base
  module ClassMethods
    # Declare this to allow models to support materials uploads.
    def has_one_folder # rubocop:disable Naming/PredicateName
      after_initialize :build_new_record_folder, if: :new_record?

      has_one :folder, as: :owner, class_name: Course::Material::Folder.name,
                       inverse_of: :owner, dependent: :destroy, autosave: true
      has_many :materials, through: :folder, class_name: Course::Material.name

      include Extensions::Materials::ActiveRecord::Base::InstanceMethods
    end
  end

  module InstanceMethods
    def files_attributes=(files)
      build_new_record_folder
      folder.build_materials(files)
    end

    private

    def build_new_record_folder
      build_folder unless folder
    end
  end
end
