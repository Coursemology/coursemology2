class Course::Material::MaterialsController < Course::ComponentController
  load_and_authorize_resource :folder, through: :course, id_param: :folder_id,
                                       through_association: :material_folders,
                                       class: Course::Material::Folder.name
  load_and_authorize_resource :material, through: :folder, class: Course::Material.name

  def show
  end

  def edit
  end

  def update
    if @material.update_attributes(material_params)
      redirect_to course_material_folder_path(current_course, @folder),
                  success: t('.success', name: @material.name)
    else
      render 'edit'
    end
  end

  def destroy
    if @material.destroy
      redirect_to course_material_folder_path(current_course, @folder),
                  success: t('.success', name: @material.name)
    else
      redirect_to course_material_folder_path(current_course, @folder),
                  danger: t('.failure', error: @material.errors.full_messages.to_sentence)
    end
  end

  def material_params
    params.require(:material).permit(:name, :description, attachments_params)
  end
end
