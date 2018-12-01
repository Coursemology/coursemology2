# frozen_string_literal: true
class Course::Video::Submission::SessionsController < Course::Video::Submission::Controller
  load_and_authorize_resource :session, class: Course::Video::Session.name, through: :submission

  def create
    head :bad_request unless @session.save
  end

  def update
    # We received a message from client, so time is updated regardless of how event records turn out
    if params[:is_old_session]
      @session.update_attributes!(last_video_time: update_params[:last_video_time])
    else
      @session.update_attributes!(session_end: Time.zone.now,
                                  last_video_time: update_params[:last_video_time])
    end
    @session.merge_in_events!(update_params[:events])
    # Update video duration using data from frontend VideoPlayer
    @video.update(duration: video_params[:video_duration].round) if @video.duration < video_params[:video_duration]
    @video.statistic.update(cached: false) if @video.statistic&.cached

    head :no_content
  rescue ArgumentError => _
    head :bad_request
  rescue ActiveRecord::RecordInvalid => _
    head :bad_request
  end

  private

  def current_tab
    @video.tab
  end

  def update_params
    params.require(:session).permit(:last_video_time,
                                    events: [[:sequence_num, :event_type, :video_time,
                                              :playback_rate, :event_time]])
  end

  def video_params
    params.permit(:video_duration)
  end
end
