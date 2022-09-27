# frozen_string_literal: true

json.id @submission.id
json.createdAt @submission.created_at
json.courseUserId @submission.creator.id
json.courseUserName @submission.creator.name
json.videoTitle @video.title
json.videoDescription @video.description

if @sessions
  json.videoStatistics do
    json.partial! @video, hide_next: true

    json.statistics do
      json.sessions do
        @sessions.each do |session|
          json.set! session.id do
            json.partial! session
          end
        end
      end
      json.watchFrequency @submission.statistic&.watch_freq || @submission.watch_frequency
    end
  end
end
