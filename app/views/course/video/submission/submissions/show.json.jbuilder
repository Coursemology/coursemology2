json.partial! @video, hide_next: true

json.statistics do
  json.sessions do
    @sessions.each do |session|
      json.set! session.id do
        json.partial! session
      end
    end
  end
  json.submissionUrl edit_course_video_submission_url(current_course, @video, @submission)
end
