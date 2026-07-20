# frozen_string_literal: true
# Records a course staff member's rating of an AI-generated rubric feedback post. The (unrated) rating record
# is initialized when the draft post is created (see Course::Assessment::Answer::AiGeneratedPostService); this
# endpoint sets the numeric score. The edited feedback is snapshotted separately from the post lifecycle (when
# the draft is published or rejected -- see Course::Discussion::Post#capture_ai_generated_rating_edit).
# Staff-only (see Course::DiscussionsAbilityComponent).
class Course::Discussion::PostAiFeedbackRatingsController < Course::ComponentController
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
    @topic = Course::Discussion::Topic.find(params[:topic_id])
    @post = @topic.posts.find(params[:id])
    @rating = @post.ai_feedback_rating
    return head :not_found unless @rating

    authorize!(:update, @rating)
  end

  def rating_param
    params.permit(:rating)[:rating]
  end

  # @return [Course::Discussion::TopicsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_discussion_topics_component]
  end
end
