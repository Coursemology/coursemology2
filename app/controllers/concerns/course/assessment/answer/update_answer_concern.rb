# frozen_string_literal: true
module Course::Assessment::Answer::UpdateAnswerConcern
  extend ActiveSupport::Concern

  private

  def update_answer(answer, answer_params)
    update_answer_params = update_answer_params(answer, answer_params)

    specific_answer = answer.specific
    specific_answer.assign_params(update_answer_params)
    # Saving the specific_answer to forward validation errors
    return true if specific_answer.save

    answer.errors.merge!(specific_answer.errors)
    false
  end

  protected

  def update_answer_params(answer, update_params)
    update_params.
      permit([:id, :client_version] + additional_answer_params(answer)).
      merge(last_session_id: current_session_id)
  end

  def additional_answer_params(answer)
    [].tap do |result|
      result.push(*update_specific_answer_type_params(answer)) if can?(:update, answer)
      result.push(:grade) if can?(:grade, answer) && !answer.submission.attempting?
    end
  end

  def update_specific_answer_type_params(answer) # rubocop:disable Metrics/MethodLength,Metrics/CyclomaticComplexity
    answer_actable_class = answer.actable.class.name
    scalar_params = []
    array_params = {}

    case answer_actable_class
    when 'Course::Assessment::Answer::MultipleResponse'
      update_multiple_response_params(array_params)
    when 'Course::Assessment::Answer::Programming'
      update_programming_params(array_params)
    when 'Course::Assessment::Answer::TextResponse'
      update_text_response_params(scalar_params)
    when 'Course::Assessment::Answer::RubricBasedResponse'
      update_rubric_based_response_params(scalar_params, array_params, answer)
    when 'Course::Assessment::Answer::VoiceResponse'
      update_voice_response_params(scalar_params)
    when 'Course::Assessment::Answer::Scribing'
      nil
    when 'Course::Assessment::Answer::ForumPostResponse'
      update_forum_post_response_params(scalar_params, array_params)
    end

    scalar_params.push(array_params)
  end

  def update_multiple_response_params(array_params)
    array_params[:option_ids] = []
  end

  def update_programming_params(array_params)
    array_params[:files_attributes] = [:id, :filename, :content]
  end

  def update_text_response_params(scalar_params)
    scalar_params.push(:answer_text)
    scalar_params.push(attachments_params)
  end

  def update_voice_response_params(scalar_params)
    scalar_params.push(attachments_params)
  end

  def update_rubric_based_response_params(scalar_params, array_params, answer)
    scalar_params.push(:answer_text)
    return unless can?(:grade, answer) && !answer.submission.attempting?

    array_params[:selections_attributes] = [:id, :answer_id, :category_id, :criterion_id, :grade, :explanation]
  end

  def update_forum_post_response_params(scalar_params, array_params)
    scalar_params.push(:answer_text)
    forum_post_attributes = [:id, :text, :creatorId, :updatedAt]
    array_params[:selected_post_packs] =
      [core_post: forum_post_attributes, parent_post: forum_post_attributes, topic: [:id]]
  end
end
