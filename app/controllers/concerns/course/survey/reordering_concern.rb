# frozen_string_literal: true
module Course::Survey::ReorderingConcern
  extend ActiveSupport::Concern

  def reorder_questions
    if valid_ordering?(reorder_questions_params)
      update_questions_ordering(reorder_questions_params)
      render_survey_with_questions_json
    else
      head :bad_request
    end
  end

  private

  def reorder_questions_params
    params.require(:ordering)
  end

  # Checks if a proposed question ordering is valid. The sections should belong to the current
  # survey and each question for this survey should be present in the ordering.
  #
  # @param [Array<Array(Integer, Array<Integer>)>] proposed_ordering
  #   Each element in the second-level array consist of a section's id and an ordered array
  #   of question_ids for questions belonging to that section.
  # @return [Boolean]
  def valid_ordering?(proposed_ordering)
    ordering_hash = proposed_ordering.to_h
    section_ids = ordering_hash.keys
    question_ids = ordering_hash.values.flatten
    valid_section_ids?(section_ids) && valid_question_ids?(question_ids)
  end

  # Checks if an array of section_ids belong to this survey.
  #
  # @param [Array<Integer>] section_ids
  # @return [Boolean]
  def valid_section_ids?(section_ids)
    survey_section_ids = @survey.sections.pluck(:id)
    section_ids.to_set.subset?(survey_section_ids.to_set)
  end

  # Checks if a given array of question_ids matches the list of question_ids for this survey.
  #
  # @param [Array<Integer>] question_ids
  # @return [Boolean]
  def valid_question_ids?(question_ids)
    survey_question_ids = @survey.questions.order(id: :asc).pluck(:id)
    question_ids.sort == survey_question_ids
  end

  # Persists a given question ordering for this survey.
  #
  # @param [Array<Array(Integer, Array<Integer>)>] ordering
  #   Each element in the second-level array consist of a section's id and an ordered array
  #   of question_ids for questions belonging to that section.
  def update_questions_ordering(ordering)
    questions_hash = @survey.questions.map { |question| [question.id, question] }.to_h
    Course::Assessment::Question.transaction do
      ordering.each do |section_id, question_ids|
        question_ids.each_with_index do |question_id, index|
          question = questions_hash[question_id]
          update_question_ordering(question, index, section_id)
        end
      end
    end
  end

  # Updates the weight and section_id for the given question.
  #
  # @param [Course::Survey::Question] question
  # @param [Integer] weight
  # @param [Integer] section_id
  def update_question_ordering(question, weight, section_id)
    attibutes = { weight: weight }
    attibutes[:section_id] = section_id if question.section_id != section_id
    raise ActiveRecord::Rollback unless question.update(attibutes)
  end
end
