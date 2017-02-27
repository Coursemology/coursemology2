# frozen_string_literal: true
module Course::Lecture::StubbedBraincertApiService
  def initialize(lecture, _settings)
    @lecture = lecture
  end

  private

  def create_classroom
    @lecture.update! classroom_id: 1
  end

  def generate_classroom_link(_user, is_instructor)
    link = "https://lecture_link_#{@lecture.id}.com"
    @lecture.update! instructor_classroom_link: link if is_instructor
    [link, nil]
  end
end

Course::Lecture::BraincertApiService.class_eval do
  prepend Course::Lecture::StubbedBraincertApiService
end
