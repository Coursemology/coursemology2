# frozen_string_literal: true
class Course::Material::Controller < Course::ComponentController
  load_and_authorize_resource :folder, through: :course, through_association: :material_folders,
                                       class: 'Course::Material::Folder'

  private

  # @return [Course::MaterialsComponent] The materials component.
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_materials_component]
  end
  helper_method :component

  def root_folder_name
    component.settings.title || t('course.material.sidebar_title')
  end
end
