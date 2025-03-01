# frozen_string_literal: true
class Course::Material::Controller < Course::ComponentController
  load_and_authorize_resource :folder, through: :course, through_association: :material_folders,
                                       class: 'Course::Material::Folder'

  def create_text_chunks
    material_ids = material_chunking_params[:material_ids]
    job = nil
    if material_ids.length == 1
      @material = Course::Material.find(material_ids.first)
      job = last_text_chunking_job
    end

    if job
      render partial: 'jobs/submitted', locals: { job: job }
    else
      job = Course::Material.text_chunking!(material_ids, current_user)
      render partial: 'jobs/submitted', locals: { job: job.job }
    end
  end

  def destroy_text_chunks
    if Course::Material.destroy_text_chunk_references(material_chunking_params[:material_ids])
      head :ok
    else
      render json: { errors: @material.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def material_chunking_params
    params.require(:material).permit(material_ids: [])
  end

  def last_text_chunking_job
    job = @material.text_chunking&.job
    (job&.status == 'submitted') ? job : nil
  end

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
