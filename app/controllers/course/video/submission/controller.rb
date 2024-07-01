# frozen_string_literal: true
class Course::Video::Submission::Controller < Course::Video::Controller
  load_and_authorize_resource :submission, class: 'Course::Video::Submission', through: :video
end
