# frozen_string_literal: true

class Course::VirtualClassroom::BraincertApiService
  def initialize(virtual_classroom, settings)
    @virtual_classroom = virtual_classroom
    @settings = settings
  end

  def handle_access_link(user, is_instructor)
    msg = virtual_classroom_inactive?
    return [nil, msg] if msg
    _, error = create_classroom
    return [nil, error] if error
    generate_classroom_link(user, is_instructor)
  end

  def fetch_recorded_videos
    return nil unless @virtual_classroom.classroom_id && @virtual_classroom.ended?
    response = call_braincert_api '/v2/getclassrecording', class_id: @virtual_classroom.classroom_id
    response_body = [JSON.parse(response.body)].flatten.select do |h|
      h['id'].present? || h['status'] == 'error'
    end
    @virtual_classroom.update! recorded_videos: response_body
    response_body
  end

  def fetch_recorded_video_link(record_id)
    response = call_braincert_api('/v2/getrecording', record_id: record_id)
    response_body = JSON.parse(response.body)
    if response_body.is_a?(Hash)
      error = response_body['error']
      return [nil, I18n.t(:'course.virtual_classrooms.error_generating_video_link', error: error)]
    end
    [response_body[0]['record_url'], nil]
  end

  private

  TIME_BRAINCERT = '%I:%M%p'
  DATE_ISO = '%Y-%m-%d'
  BRAINCERT_API_BASE_URL = 'https://api.braincert.com'

  # Entry point for generating virtual classroom link for a VirtualClassroom
  #
  # @param [User] user The user from whom the request comes
  # @param [Boolean] is_instructor Whether the user is an instructor
  #   (has "manage" permission of virtual_classroom)
  # @return [Array] of format [link, errors]
  def generate_classroom_link(user, is_instructor)
    response = call_braincert_api('/v2/getclasslaunch',
                             generate_classroom_link_params(user, is_instructor))
    response_body = JSON.parse(response.body)
    error = response_body['error']
    return [nil, I18n.t(:'course.virtual_classrooms.error_generating_link', error: error)] if error
    access_link = response_body['encryptedlaunchurl']
    save_instructor_info(access_link, user) if is_instructor
    [access_link, nil]
  end

  def save_instructor_info(access_link, user)
    @virtual_classroom.instructor_classroom_link = access_link
    @virtual_classroom.instructor ||= user
    @virtual_classroom.save!
  end

  def generate_classroom_link_params(user, is_instructor)
    lesson_name = @virtual_classroom.title
    {
      class_id: @virtual_classroom.classroom_id,
      userId: user.id,
      userName: user.name,
      isTeacher: is_instructor ? '1' : '0',
      lessonName: lesson_name,
      courseName: lesson_name
    }
  end

  def virtual_classroom_inactive?
    return if @virtual_classroom.currently_active?
    diff = @virtual_classroom.start_at - Time.zone.now
    if diff > 0
      desc = ActionController::Base.helpers.distance_of_time_in_words(
        distance_of_time_in_words(diff)
      )
      I18n.t(:'course.virtual_classrooms.lesson_live_in', desc: desc)
    else
      I18n.t(:'course.virtual_classrooms.lesson_already_conducted')
    end
  end

  def post(url, params)
    Net::HTTP.post_form URI.parse(url), params
  end

  def call_braincert_api(action, params)
    action = '/' + action unless action[0] == '/'
    api_key = @settings.braincert_whiteboard_api_key
    post "#{BRAINCERT_API_BASE_URL}#{action}", params.merge(apikey: api_key)
  end

  def create_classroom
    return [@virtual_classroom.classroom_id, nil] if @virtual_classroom.classroom_id
    response = call_braincert_api '/v2/schedule', create_classroom_params
    response_body = JSON.parse(response.body)
    error = response_body['error']
    if error
      return [nil, I18n.t(:'course.virtual_classrooms.error_creating_classroom',
                          error: error)]
    end
    @virtual_classroom.update!(classroom_id: response_body['class_id']) &&
      [response_body['class_id'], nil]
  end

  def create_classroom_params
    {
      title: @virtual_classroom.title,
      timezone: @settings.braincert_whiteboard_timezone,
      start_time: @virtual_classroom.start_at.in_time_zone(0).strftime(TIME_BRAINCERT),
      end_time: @virtual_classroom.end_at.in_time_zone(0).strftime(TIME_BRAINCERT),
      date: @virtual_classroom.start_at.in_time_zone(0).to_date.strftime(DATE_ISO),
      ispaid: 0, is_recurring: 0, seat_attendees: 25, record: 1,
      isRegion: @settings.braincert_server_region
    }
  end
end
