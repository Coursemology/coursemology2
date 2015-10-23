class Course::Material::Controller < Course::ComponentController
  load_and_authorize_resource :folder, through: :course, through_association: :material_folders,
                                       class: Course::Material::Folder.name

  before_action :check_component

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
end
