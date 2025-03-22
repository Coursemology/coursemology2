# frozen_string_literal: true
class Course::Forum::AutoAnsweringJob < ApplicationJob
  include TrackableJob
  include Course::Forum::AutoAnsweringConcern

  queue_as :lowest

  protected

  def perform_tracked(post, topic, current_author, current_course_author, settings)
    answering!(post)
    evaluation = RagWise::ResponseEvaluationService.new(settings[:response_workflow])
    response = RagWise::RagWorkflowService.new(post.topic.course, evaluation, settings[:roleplay]).
               get_assistant_response(post, topic)
    response_post = create_response_post(post, response, current_author, evaluation)

    publish_if_needed(response_post, topic, current_author, current_course_author)
    cancel_answering!(post)
  rescue StandardError => e
    cancel_answering!(post)
    # re-raise error to make the job error out
    raise e
  end

  private

  def create_response_post(post, response, current_author, evaluation)
    Course::Discussion::Post.create!(
      creator: current_author,
      updater: current_author,
      parent_id: post.parent&.id || post.id,
      is_ai_generated: true,
      text: response,
      original_text: response,
      workflow_state: evaluation.evaluate ? 'published' : 'draft',
      faithfulness_score: evaluation.scores ? evaluation.scores[:faithfulness_score] : 0.0,
      answer_relevance_score: evaluation.scores ? evaluation.scores[:answer_relevance_score] : 0.0
    )
  end

  def publish_if_needed(post, topic, current_author, current_course_author)
    return unless post.reload.workflow_state == 'published'

    publish_post(post, topic, current_author, current_course_author)
  end

  def answering!(post)
    post.answer!
    post.save!
  end

  def cancel_answering!(post)
    post.answered!
    post.save!
  end
end
