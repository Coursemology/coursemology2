# frozen_string_literal: true
class Course::Story::RoomsController < Course::Story::Controller
  include Course::UsersHelper

  load_and_authorize_resource :room, through: :story

  before_action -> { @course_users_hash = preload_course_users_hash(current_course) }, only: [:index]

  def index
  end

  def show
    @creator_course_user = current_course.course_users.for_user(@room.creator).first
    provided_user_id = create_genie_user(@room.creator)

    # TODO: To move to #create
    unless @room.provided_room_id.present?
      provided_room_id = GenieApiService.create_chat_room(@story.id, provided_user_id)
      @room.update!(provided_room_id: provided_room_id)
    end
  end

  def create_genie_user(user)
    image = "http://lvh.me:8080/#{user.profile_photo.medium.url}"
    provided_user_id = GenieApiService.authenticate(user, image)
    (user.genie_user || user.build_genie_user).provided_user_id = provided_user_id
    user.genie_user.save!

    provided_user_id
  end

  def user_image(user)
    image_path(user.profile_photo.medium.url) if user&.profile_photo&.medium&.url
  end

  def sync
    result = GenieApiService.sync_chat_room(@room.provided_room_id)
    @room.update!(completed: result[:completed])

    render json: { completed: @room.completed? }
  end
end
