# frozen_string_literal: true
module Course::Assessment::Answer::UpdateAnswerConcern
  extend ActiveSupport::Concern

  private

  def update_answer(answer, answer_params)
    update_answer_params = update_answer_params(answer, answer_params)

    specific_answer = answer.specific
    specific_answer.assign_params(update_answer_params)
    answer.save
  end

  protected

  def update_answer_params(answer, update_params)
    update_params.
      permit([:id, :client_version] + additional_answer_params(answer)).
      merge(last_session_id: session.id)
  end

  def additional_answer_params(answer)
    [].tap do |result|
      result.push(*update_specific_answer_type_params(answer)) if can?(:update, answer)
      result.push(:grade) if can?(:grade, answer) && !answer.submission.attempting?
    end
  end

  def update_specific_answer_type_params(answer) # rubocop:disable Metrics/MethodLength
    answer_actable_class = answer.actable.class.name
    scalar_params = []
    array_params = {}

    case answer_actable_class
    when 'Course::Assessment::Answer::MultipleResponse'
      array_params[:option_ids] = []
    when 'Course::Assessment::Answer::Programming'
      array_params[:files_attributes] = [:id, :filename, :content]
    when 'Course::Assessment::Answer::TextResponse'
      scalar_params.push(:answer_text)
      scalar_params.push(attachments_params)
    when 'Course::Assessment::Answer::VoiceResponse'
      scalar_params.push(attachments_params)
    when 'Course::Assessment::Answer::Scribing'
      nil
    when 'Course::Assessment::Answer::ForumPostResponse'
      scalar_params.push(:answer_text)
      forum_post_attributes = [:id, :text, :creatorId, :updatedAt]
      array_params[:selected_post_packs] =
        [core_post: forum_post_attributes, parent_post: forum_post_attributes, topic: [:id]]
    end

    scalar_params.push(array_params)
  end
end
