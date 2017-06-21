# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Scribing::ScribblesController < \
  Course::Assessment::Submission::Answer::Scribing::Controller

  before_action :load_scribble, only: [:create]

  def create
    if @scribble
      @scribble.update_attributes(scribble_params)
    else
      @scribble = Course::Assessment::Answer::ScribingScribble.new(scribble_params)
      @scribble.save
    end

    respond_to do |format|
      format.json { render json: @scribing_answer }
    end
  end

  private

  def scribble_params
    params.require(:scribble).permit(:answer_id, :content)
  end

  def load_scribble
    @scribble = Course::Assessment::Answer::ScribingScribble.
                find_by(creator: current_user, answer_id: scribble_params[:answer_id])
  end
end
