# frozen_string_literal: true
require 'csv'

class Course::Survey::SurveyDownloadService
  include TmpCleanupHelper
  include ApplicationFormattersHelper

  def initialize(survey)
    @survey = survey
    @base_dir = Dir.mktmpdir('coursemology-survey-')
  end

  # Downloads the survey to its own folder in the base directory.
  #
  # @return [String] The path to the csv file.
  def generate
    survey_csv = generate_csv
    normalized_filename = "#{Pathname.normalize_filename(@survey.title)}.csv"
    dst_path = File.join(@base_dir, normalized_filename)
    File.open(dst_path, 'w') do |dst_file|
      dst_file.write(survey_csv)
    end
    dst_path
  end

  private

  def cleanup_entries
    [@base_dir]
  end

  # Converts survey to string csv format.
  #
  # @return [String] The survey in csv format.
  def generate_csv
    responses = Course::Survey::Response.
                where.not(submitted_at: nil).
                includes(answers: [:options, :question]).
                where(survey: @survey)
    questions = @survey.questions.
                merge(Course::Survey::Section.order(:weight)).
                merge(Course::Survey::Question.order(:weight)).
                to_a
    header = generate_header(questions)

    CSV.generate(headers: true, force_quotes: true) do |csv|
      csv << header
      responses.each do |response|
        csv << generate_row(response, questions)
      end
    end
  end

  def generate_header(questions)
    [
      I18n.t('course.surveys.survey_download_service.created_at'),
      I18n.t('course.surveys.survey_download_service.updated_at'),
      I18n.t('course.surveys.survey_download_service.course_user_id'),
      I18n.t('course.surveys.survey_download_service.name'),
      I18n.t('course.surveys.survey_download_service.role')
    ] + questions.map { |q| format_rich_text_for_csv(q.description) }
  end

  def generate_row(response, questions)
    answers_hash = response.answers.to_h { |answer| [answer.question_id, answer] }
    values = questions.map do |question|
      answer = answers_hash[question.id]
      generate_value(answer)
    end
    [
      response.submitted_at,
      response.submitted_at ? response.updated_at : response.submitted_at,
      response.course_user.id,
      response.course_user.name,
      response.course_user.role,
      *values
    ]
  end

  def generate_value(answer)
    # Handles the case where there is no answer.
    # This happens when a question is added after the user has submitted a response.
    return '' if answer.nil?

    question = answer.question

    return answer.text_response || '' if question.text?

    return generate_mcq_mrq_value(answer) if question.multiple_choice? || question.multiple_response?

    I18n.t('course.surveys.survey_download_service.unknown_question_type')
  end

  def generate_mcq_mrq_value(answer)
    answer.options.
      sort_by { |option| option.question_option.weight }.
      map { |option| option.question_option.option }.
      join(';')
  end
end
