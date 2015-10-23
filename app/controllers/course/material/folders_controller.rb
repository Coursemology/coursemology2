class Course::Material::FoldersController < Course::Material::Controller
  def show
  end

  def edit
  end

  def update
    if @folder.update_attributes(folder_params)
      redirect_folder = @folder.parent ? @folder.parent : @folder
      redirect_to course_material_folder_path(current_course, redirect_folder),
                  success: t('.success', name: @folder.name)
    else
      render 'edit'
    end
  end

  def destroy
    parent_folder = @folder.parent
    if @folder.destroy
      redirect_to course_material_folder_path(current_course, parent_folder),
                  success: t('.success', name: @folder.name)
    else
      redirect_to course_material_folder_path(current_course, parent_folder),
                  danger: t('.failure', error: @folder.errors.full_messages.to_sentence)
    end
  end

  def new_subfolder
    @subfolder = Course::Material::Folder.new
  end

  def create_subfolder
    @subfolder = Course::Material::Folder.new(folder_params)
    @subfolder.course = current_course
    if @subfolder.save
      redirect_to course_material_folder_path(current_course, @folder),
                  success: t('.success', name: @subfolder.name)
    else
      render 'new_subfolder'
    end
  end

  def new_materials
  end

  def upload_materials
    if @folder.update_attributes(files_params)
      redirect_to course_material_folder_path(current_course, @folder),
                  success: t('.success', name: @folder.name)
    else
      upload_materials_failure
    end
  end

  private

  def folder_params
    params.require(:material_folder).permit(:parent_id, :name, :description, :can_student_upload,
                                            :start_at, :end_at)
  end

  def files_params
    params.require(:material_folder).permit(files_attributes: [])
  end

  def upload_materials_failure
    flash.now[:danger] = t('course.material.folders.upload_materials.failure',
                           error: @folder.errors.full_messages.to_sentence)
    render 'new_materials'
  end
end
