# frozen_string_literal: true
class Course::Material::MaterialsController < Course::Material::Controller
  load_and_authorize_resource :material, through: :folder, class: Course::Material.name

  def show
    redirect_to @material.attachment.url
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

  private

  def material_params
    params.require(:material).permit(:name, :description, attachments_params)
  end
end
