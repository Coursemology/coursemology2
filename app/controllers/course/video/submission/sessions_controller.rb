# frozen_string_literal: true
class Course::Video::Submission::SessionsController < Course::Video::Submission::Controller
  load_and_authorize_resource :session, class: Course::Video::Session.name

  def update
    # We received a message from client, so time is updated regardless of how event records turn out
    @session.update_attributes!(session_end: Time.zone.now)
    @session.merge_in_events!(session_params[:events])
  rescue ArgumentError => _
    head :bad_request
  rescue ActiveRecord::RecordInvalid => _
    head :bad_request
  end

  private

  def session_params
    params.require(:session).permit(events: [[:sequence_num, :event_type, :video_time_initial,
                                              :video_time_final, :event_time]])
  end
end
