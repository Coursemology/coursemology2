# frozen_string_literal: true
class Course::Lecture < ActiveRecord::Base
  acts_as_readable on: :updated_at
  has_many_attachments on: :content

  belongs_to :course, inverse_of: :lectures

  scope :sorted_by_date, -> { order(start_at: :desc) }

  TIME_BRAINCERT = '%I:%M%p'
  DATE_ISO = '%Y-%m-%d'
  BRAINCERT_API_BASE_URL = 'https://api.braincert.com'

  def handle_access_link(user, is_instructor)
    if (msg = lecture_inactive?).present?
      return nil, msg
    end
    _, error = create_classroom
    return [nil, error] if error
    generate_classroom_link(user, is_instructor)
  end

  private

  # Entry point for generating virtual classroom link for a Lecture
  #
  # @param [User] user The user from whom the request comes
  # @param [Boolean] is_instructor Whether the user is an instructor
  #   (has "manage" permission of lecture)
  # @return [Array] of format [link, errors]
  def generate_classroom_link(user, is_instructor)
    res = call_braincert_api('/v2/getclasslaunch',
                             generate_classroom_link_params(user, is_instructor))
    res_body = JSON.parse(res.body)
    error = res_body['error']
    if error
      return nil, I18n.t(:'course.lectures.error_generating_link', error: error)
    else
      update!(instructor_classroom_link: res_body['encryptedlaunchurl']) if is_instructor
      [res_body['encryptedlaunchurl'], nil]
    end
  end

  def generate_classroom_link_params(user, is_instructor)
    lesson_name = title
    {
      class_id: classroom_id,
      userId: user.id,
      userName: user.name,
      isTeacher: is_instructor ? '1' : '0',
      lessonName: lesson_name,
      courseName: lesson_name
    }
  end

  def lecture_inactive?
    return if currently_active?
    diff = start_at - Time.zone.now
    if diff > 0
      I18n.t(:'course.lectures.lesson_live_in',
             desc: distance_of_time_in_words(diff))
    else
      I18n.t(:'course.lectures.lesson_already_conducted')
    end
  end

  def post(url, params)
    Net::HTTP.post_form URI.parse(url), params
  end

  def call_braincert_api(action, params)
    action = '/' + action unless action[0] == '/'
    settings = Course::LectureSettings.new(course.settings(:lecture))
    api_key = settings.braincert_whiteboard_api_key
    post "#{BRAINCERT_API_BASE_URL}#{action}",
         params.merge(apikey: api_key)
  end

  def create_classroom
    return [classroom_id, nil] if classroom_id
    res = call_braincert_api '/v2/schedule', create_classroom_params
    res_body = JSON.parse(res.body)
    error = res_body['error']
    if error
      return nil, I18n.t(:'course.lectures.error_creating_classroom', error: error)
    else
      update!(classroom_id: res_body['class_id']) && [res_body['class_id'], nil]
    end
  end

  def create_classroom_params
    {
      title: title,
      timezone: 28, # 28 means time zone 0
      start_time: start_at.in_time_zone(0).strftime(TIME_BRAINCERT),
      end_time: end_at.in_time_zone(0).strftime(TIME_BRAINCERT),
      date: start_at.in_time_zone(0).to_date.strftime(DATE_ISO),
      ispaid: 0,
      is_recurring: 0,
      seat_attendees: 25, record: 1, isRegion: 7
    }
  end
end
