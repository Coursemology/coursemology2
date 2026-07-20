# frozen_string_literal: true
# Records a course staff member's rating of a RagWise-generated forum answer post. The (unrated) rating record
# is initialized when the answer post is created (see Course::Forum::AutoAnsweringJob); this endpoint sets the
# numeric score. The edited content is snapshotted separately from the post lifecycle (when the answer is
# published or rejected -- see Course::Discussion::Post#capture_ai_generated_rating_edit). Staff-only (see
# Course::ForumsAbilityComponent).
class Course::Forum::PostRagWiseRatingsController < Course::Forum::ComponentController
  before_action :load_post_and_rating

  def update
    if @rating.update(rating: rating_param, updater: current_user)
      render json: { id: @rating.id, rating: @rating.rating }
    else
      render json: { errors: @rating.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def load_post_and_rating
    @topic = @forum.topics.friendly.find(params[:topic_id])
    @post = @topic.posts.find(params[:id])
    @rating = @post.rag_wise_rating
    return head :not_found unless @rating

    authorize!(:update, @rating)
  end

  def rating_param
    params.permit(:rating)[:rating]
  end
end
