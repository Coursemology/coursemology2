# frozen_string_literal: true
class Course::Material::FoldersController < Course::Material::Controller
  before_action :authorize_read_owner!, only: [:show, :download]

  def show
    respond_to do |format|
      format.json do
        @subfolders = @folder.children.with_content_statistics.accessible_by(current_ability).
                      order(:name).includes(:owner).without_empty_linked_folder
        # Don't display the folder if the user cannot access its owner.
        @subfolders.select! { |f| can?(:read_owner, f) }
      end
    end
  end

  def update
    if @folder.update(folder_params)
      @folder = @folder.parent || @folder
      show
      render 'show', status: :ok
    else
      render json: { errors: @folder.errors }, status: :bad_request
    end
  end

  def destroy
    parent_folder = @folder.parent
    if @folder.destroy
      head :ok
    else
      render json: { errors: @folder.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def create_subfolder
    @subfolder = Course::Material::Folder.new(folder_params)
    @subfolder.course = current_course
    if @subfolder.save
      show
      render 'show', status: :ok
    else
      render json: { errors: @subfolder.errors }, status: :bad_request
    end
  end

  def upload_materials
    @materials = @folder.build_materials(files_params[:files_attributes])
    respond_to do |format|
      if @folder.save
        format.json do
          if params[:render_show]
            show
            return render 'show', status: :ok
          end
        end
      else
        format.json do
          render json: { errors: @folder.errors.full_messages.to_sentence },
                 status: :bad_request
        end
      end
    end
  end

  def download
    @materials = (@folder.descendants.select { |f| can?(:read_owner, f) } + [@folder]).
                 map { |f| f.materials.accessible_by(current_ability) }.flatten
    zip_filename = @folder.root? ? root_folder_name : @folder.name
    job = Course::Material::ZipDownloadJob.perform_later(@folder, @materials, zip_filename).job
    respond_to do |format|
      format.json { render partial: 'jobs/submitted', locals: { job: job } }
    end
  end

  private

  def authorize_read_owner!
    authorize!(:read_owner, @folder)
  end

  def folder_params
    params.require(:material_folder).permit(:parent_id, :name, :description, :can_student_upload,
                                            :start_at, :end_at)
  end

  def files_params
    params.require(:material_folder).permit(files_attributes: [])
  end
end
