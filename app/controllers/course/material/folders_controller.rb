class Course::Material::FoldersController < Course::ComponentController
  load_and_authorize_resource :folder, through: :course, through_association: :material_folders,
                                       parent: false, class: Course::Material::Folder.name

  def show
  end

  def edit
  end

  def update
  end

  def destroy
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

  def folder_params
    params.require(:material_folder).permit(:parent_id, :name, :description, :can_student_upload,
                                            :start_at, :end_at)
  end
end
