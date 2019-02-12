# frozen_string_literal: true
require 'csv'

class Course::Survey::SurveyDownloadService
  class << self
    # Downloads the survey to its own folder in the base directory.
    #
    # @return [String] The path to the csv file.
    def download(survey)
      survey_csv = generate_csv(survey)
      base_dir = Dir.mktmpdir('coursemology-survey-')
      dst_path = File.join(base_dir, "#{survey.title}.csv")
      File.open(dst_path, 'w') do |dst_file|
        dst_file.write(survey_csv)
      end
      dst_path
    end

    private

    # Converts survey to string csv format.
    #
    # @param [Course::Survey] survey The survey to be converted
    # @return [String] The survey in csv format.
    def generate_csv(survey)
      responses = Course::Survey::Response.
                  where.not(submitted_at: nil).
                  includes(answers: [:options, :question]).
                  where(survey: survey)
      questions = survey.questions.sort_by(&:weight)
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
        I18n.t('course.surveys.survey_download_service.timestamp'),
        I18n.t('course.surveys.survey_download_service.course_user_id'),
        I18n.t('course.surveys.survey_download_service.name'),
        I18n.t('course.surveys.survey_download_service.role')
      ] + questions.map(&:description)
    end

    def generate_row(response, questions)
      answers_hash = response.answers.map { |answer| [answer.question_id, answer] }.to_h
      values = questions.map do |question|
        answer = answers_hash[question.id]
        generate_value(answer)
      end
      [
        response.submitted_at,
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

      if question.multiple_choice? || question.multiple_response?
        options = answer.options.
                  sort_by { |option| option.question_option.weight }.
                  map { |option| option.question_option.option }
        return options.join(';')
      end

      I18n.t('course.surveys.survey_download_service.unknown_question_type')
    end
  end
end
