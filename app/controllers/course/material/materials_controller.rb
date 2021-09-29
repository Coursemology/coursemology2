# frozen_string_literal: true
class Course::Material::MaterialsController < Course::Material::Controller
  load_and_authorize_resource :material, through: :folder, class: Course::Material.name

  def show
    authorize!(:read_owner, @material.folder)
    redirect_to @material.attachment.url(filename: @material.name)
  end

  def edit
  end

  def update
    if @material.update(material_params)
      redirect_to course_material_folder_path(current_course, @folder),
                  success: t('.success', name: @material.name)
    else
      render 'edit'
    end
  end

  def destroy
    if @material.destroy
      respond_to do |format|
        format.html do
          redirect_to course_material_folder_path(current_course, @folder),
                      success: t('.success', name: @material.name)
        end
        format.json { head :ok }
      end
    else
      redirect_to course_material_folder_path(current_course, @folder),
                  danger: t('.failure', message: @material.errors.full_messages.to_sentence)
    end
  end

  private

  def material_params
    params.require(:material).permit(:name, :description, attachments_params)
  end
end
