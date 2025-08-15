# frozen_string_literal: true
class Course::Scholaistic::AssistantsController < Course::Scholaistic::Controller
  def index
    authorize! :manage_scholaistic_assistants, current_course

    @embed_src = ScholaisticApiService.embed!(
      current_course_user,
      ScholaisticApiService.assistants_path,
      request.origin
    )
  end

  def show
    authorize! :read_scholaistic_assistants, current_course

    @assistant_title = ScholaisticApiService.assistant!(current_course, params[:id])[:title]

    @embed_src = ScholaisticApiService.embed!(
      current_course_user,
      ScholaisticApiService.assistant_path(params[:id]),
      request.origin
    )
  end
end
