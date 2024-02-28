# frozen_string_literal: true
class Course::Story::RoomsController < Course::Story::Controller
  include Course::UsersHelper

  load_and_authorize_resource :room, through: :story

  before_action -> { @course_users_hash = preload_course_users_hash(current_course) }, only: [:index]

  def index
  end

  def show
    @creator_course_user = current_course.course_users.for_user(@room.creator).first
    provided_user_id = create_cikgo_user(@room.creator)

    # TODO: To move to #create
    unless @room.provided_room_id.present?
      provided_room_id = CikgoApiService.create_chat_room(@story.id, provided_user_id)
      @room.update!(provided_room_id: provided_room_id)
    end
  end

  def create_cikgo_user(user)
    image = "http://lvh.me:8080/#{user.profile_photo.medium.url}"
    provided_user_id = CikgoApiService.authenticate(user, image)
    (user.cikgo_user || user.build_cikgo_user).provided_user_id = provided_user_id
    user.cikgo_user.save!

    provided_user_id
  end

  def user_image(user)
    image_path(user.profile_photo.medium.url) if user&.profile_photo&.medium&.url
  end

  def sync
    @room.update!(completed: Cikgo::RoomsService.completed?(@room.provided_room_id))
    render json: { completed: @room.completed? }
  end
end
