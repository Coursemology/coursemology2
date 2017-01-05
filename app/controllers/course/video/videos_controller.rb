# frozen_string_literal: true
class Course::Video::VideosController < Course::Video::Controller
  def index #:nodoc:
    @videos = @videos.ordered_by_date
  end
end
