json.partial! @video, hide_next: true

json.statistics do
  json.sessions do
    @sessions.each do |session|
      json.set! session.id do
        json.partial! session
      end
    end
  end
  json.watchFrequency @submission.watch_frequency
end
