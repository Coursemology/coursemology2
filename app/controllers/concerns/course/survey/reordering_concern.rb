# frozen_string_literal: true
module Course::Survey::ReorderingConcern
  extend ActiveSupport::Concern

  def reorder_sections
    if valid_section_ordering?(reorder_params)
      update_sections_ordering(reorder_params)
      render_survey_with_questions_json
    else
      head :bad_request
    end
  end

  def reorder_questions
    if valid_question_ordering?(reorder_params)
      update_questions_ordering(reorder_params)
      render_survey_with_questions_json
    else
      head :bad_request
    end
  end

  private

  def reorder_params
    params.require(:ordering)
  end

  # Checks if the given list of section ids matches the survey sections ids.
  #
  # @param [Array<Integer>] proposed_ordering List of section ids
  # @return [Boolean] true if the proposed ordering is valid
  def valid_section_ordering?(proposed_ordering)
    valid_section_ids?(proposed_ordering, require_all: true)
  end

  # Checks if a proposed question ordering is valid. The sections should belong to the current
  # survey and each question for this survey should be present in the ordering.
  #
  # @param [Array<Array(Integer, Array<Integer>)>] proposed_ordering
  #   Each element in the second-level array consist of a section's id and an ordered array
  #   of question_ids for questions belonging to that section.
  # @return [Boolean]
  def valid_question_ordering?(proposed_ordering)
    ordering_hash = proposed_ordering.to_h
    section_ids = ordering_hash.keys
    question_ids = ordering_hash.values.flatten
    valid_section_ids?(section_ids) && valid_question_ids?(question_ids)
  end

  # Checks if an array of section_ids belong to this survey. If require_all is true,
  # ensure all sections ids are included in the given array.
  #
  # @param [Array<Integer>] section_ids
  # @return [Boolean]
  def valid_section_ids?(section_ids, require_all: false)
    given_set = section_ids.to_set
    return false if given_set.size != section_ids.size
    valid_set = @survey.sections.pluck(:id).to_set
    require_all ? given_set == valid_set : given_set.subset?(valid_set)
  end

  # Checks if a given array of question_ids matches the list of question_ids for this survey.
  #
  # @param [Array<Integer>] question_ids
  # @return [Boolean]
  def valid_question_ids?(question_ids)
    survey_question_ids = @survey.questions.order(id: :asc).pluck(:id)
    question_ids.sort == survey_question_ids
  end

  # Persists a given section ordering for this survey.
  #
  # @param [Array<Integer>] ordering
  def update_sections_ordering(ordering)
    weights = ordering.map.with_index { |id, weight| [id, weight] }.to_h
    Course::Survey::Section.transaction do
      @survey.sections.each do |survey|
        survey.update_attribute(:weight, weights[survey.id])
      end
    end
  end

  # Persists a given question ordering for this survey.
  #
  # @param [Array<Array(Integer, Array<Integer>)>] ordering
  #   Each element in the second-level array consist of a section's id and an ordered array
  #   of question_ids for questions belonging to that section.
  def update_questions_ordering(ordering)
    questions_hash = @survey.questions.map { |question| [question.id, question] }.to_h
    Course::Survey::Question.transaction do
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
