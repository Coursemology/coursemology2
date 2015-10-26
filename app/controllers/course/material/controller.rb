class Course::Material::Controller < Course::ComponentController
  load_and_authorize_resource :folder, through: :course, through_association: :material_folders,
                                       class: Course::Material::Folder.name

  before_action :check_component
  before_action :add_folder_breadcrumb

  private

  # @return [Course::MaterialsComponent|nil] The materials component or nil if disabled.
  def component
    current_component_host[:course_materials_component]
  end
  helper_method :component

  # Ensure that the component is enabled.
  #
  # @raise [Coursemology::ComponentNotFoundError] When the component is disabled.
  def check_component
    fail ComponentNotFoundError unless component
  end

  def add_folder_breadcrumb
    folders_chain = @folder.ancestors.reverse << @folder
    root_folder = folders_chain.shift

    add_breadcrumb component.settings.title || t('course.material.sidebar_title'),
                   course_material_folder_path(current_course, root_folder)
    folders_chain.each do |folder|
      add_breadcrumb folder.name, course_material_folder_path(current_course, folder)
    end
  end
end
