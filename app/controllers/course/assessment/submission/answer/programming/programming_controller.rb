# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Programming::ProgrammingController < \
  Course::Assessment::Submission::Answer::Programming::Controller
  load_resource :actable, class: Course::Assessment::Answer::Programming.name,
                          singleton: true, through: :answer
  before_action :set_programming_answer

  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  def create_programming_files
    authorize! :create_programming_files, @programming_answer

    if update_answer_files_attributes(create_programming_files_params)
      render @programming_answer.answer
    else
      render_programming_answer_errors
    end
  end

  def destroy_programming_file
    authorize! :destroy_programming_file, @programming_answer

    file_id = delete_programming_file_params[:file_id].to_i
    client_version = delete_programming_file_params[:client_version]
    if delete_programming_file(file_id, client_version)
      render json: { answerId: @programming_answer.answer.id, fileId: file_id }
    else
      render_programming_answer_errors
    end
  end

  private

  def render_programming_answer_errors
    @programming_answer.errors.messages.each do |attribute, message|
      @programming_answer.answer.errors.add(attribute, message)
    end
    render json: { errors: @programming_answer.answer.errors.messages }, status: :bad_request
  end

  def create_programming_files_params
    params.require(:answer).permit(
      [:client_version, files_attributes: [:id, :filename, :content]]
    ).merge(session_id: session.id)
  end

  def delete_programming_file_params
    params.require(:answer).permit([:id, :file_id, :client_version])
  end

  def update_answer_files_attributes(answer_params)
    @programming_answer.create_and_update_files(answer_params)
  end

  def delete_programming_file(file_id, client_version)
    @programming_answer.delete_file(file_id, client_version, session.id)
  end
end
