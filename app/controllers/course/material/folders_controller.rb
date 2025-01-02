# frozen_string_literal: true
class Course::Material::FoldersController < Course::Material::Controller
  rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
  skip_load_resource :folder, only: [:index]
  before_action :authorize_read_owner!, only: [:show, :download]

  def index
    load_root_folder_with_subfolders
    render 'show' unless performed?
  end

  def show
    load_subfolders
  end

  def update
    if @folder.update(folder_params)
      @folder = params[:is_current_folder] == 'true' ? @folder : @folder.parent
      load_subfolders
      render 'show'
    else
      render json: { errors: @folder.errors }, status: :bad_request
    end
  end

  def destroy
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
      load_subfolders
      render 'show'
    else
      render json: { errors: @subfolder.errors }, status: :bad_request
    end
  end

  def upload_materials
    @materials = @folder.build_materials(files_params[:files_attributes])
    if @folder.save
      if params[:render_show]
        load_subfolders
        render 'show'
      end
    else
      render json: { errors: @folder.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def download
    @materials = (@folder.descendants.select { |f| can?(:read_owner, f) } + [@folder]).
                 map { |f| f.materials.accessible_by(current_ability) }.flatten
    zip_filename = @folder.root? ? root_folder_name : @folder.name
    job = Course::Material::ZipDownloadJob.perform_later(@folder, @materials, zip_filename).job
    render partial: 'jobs/submitted', locals: { job: job }
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

  def load_subfolders
    @subfolders = @folder.children.with_content_statistics.accessible_by(current_ability).
                  order(:name).includes(:owner).without_empty_linked_folder
    # Don't display the folder if the user cannot access its owner.
    @subfolders.select! { |f| can?(:read_owner, f) }
  end

  def load_root_folder_with_subfolders
    @folder = current_course.root_folder
    load_subfolders
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Missing root folder' }, status: :not_found
  end

  def handle_not_found
    load_root_folder_with_subfolders
    render 'show', status: :not_found unless performed?
  end
end
