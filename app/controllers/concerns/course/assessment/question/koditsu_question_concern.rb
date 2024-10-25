# frozen_string_literal: true
# rubocop:disable Metrics/ModuleLength
module Course::Assessment::Question::KoditsuQuestionConcern
  extend ActiveSupport::Concern
  include Course::Assessment::KoditsuAssessmentConcern

  def create_koditsu_question
    workspace_id = current_course.koditsu_workspace_id
    service = Course::Assessment::Question::KoditsuQuestionService.
              new(@programming_question, workspace_id, @meta, current_course)

    status, response = service.run_create_koditsu_question

    adjust_question_from_koditsu_response(status, response)
  end

  def adjust_question_from_koditsu_response(status, response)
    @question = @programming_question.acting_as

    if status == 201
      @question.update!({
        koditsu_question_id: response['id'],
        is_synced_with_koditsu: true
      })
      @assessment.update!(is_synced_with_koditsu: false)
    else
      @question.update!(is_synced_with_koditsu: false)
    end
  end

  def arrange_questions_in_assessment_in_koditsu
    @assessment.reload && @assessment.questions.reload

    koditsu_questions = @assessment.questions.map do |question|
      {
        id: question.koditsu_question_id,
        type: 'QuestionCoding',
        score: question.maximum_grade.to_i,
        maxAttempts: question.specific.attempt_limit&.to_i
      }
    end

    status = edit_koditsu_assessment(@assessment, koditsu_questions, current_course, monitoring_configuration)

    return unless status == 200 && @assessment.questions.reload.all?(&:is_synced_with_koditsu)

    @assessment.update!(is_synced_with_koditsu: true)
  end

  def edit_koditsu_question
    koditsu_question_id = @question.koditsu_question_id

    service = Course::Assessment::Question::KoditsuQuestionService.
              new(@programming_question, nil, @meta, current_course)
    status = service.run_edit_koditsu_question(koditsu_question_id)

    @question.update!(is_synced_with_koditsu: true) if status == 200
  end

  def delete_koditsu_question(id)
    api_service = KoditsuAsyncApiService.new("api/question/coding/#{id}", nil)
    response_status, = api_service.delete

    response_status
  end

  def create_or_edit_question_in_koditsu
    extract_programming_question_metadata

    if @programming_question.acting_as.koditsu_question_id
      edit_koditsu_question
    else
      create_koditsu_question
    end
  end

  def extract_programming_question_metadata
    return unless @programming_question.edit_online?

    @meta = programming_package_service.extract_meta
  end

  def programming_package_service
    @service = Course::Assessment::Question::Programming::ProgrammingPackageService.new(
      @programming_question, nil
    )
  end

  def koditsu_programming_language_map
    {
      Coursemology::Polyglot::Language::CPlusPlus => {
        language: 'cpp',
        version: '10.2',
        filename: 'template.cpp'
      },
      Coursemology::Polyglot::Language::Python::Python3Point4 => {
        language: 'python',
        version: '3.4',
        filename: 'main.py'
      },
      Coursemology::Polyglot::Language::Python::Python3Point5 => {
        language: 'python',
        version: '3.5',
        filename: 'main.py'
      },
      Coursemology::Polyglot::Language::Python::Python3Point6 => {
        language: 'python',
        version: '3.6',
        filename: 'main.py'
      },
      Coursemology::Polyglot::Language::Python::Python3Point7 => {
        language: 'python',
        version: '3.7',
        filename: 'main.py'
      },
      Coursemology::Polyglot::Language::Python::Python3Point9 => {
        language: 'python',
        version: '3.9',
        filename: 'main.py'
      },
      Coursemology::Polyglot::Language::Python::Python3Point10 => {
        language: 'python',
        version: '3.10',
        filename: 'main.py'
      },
      Coursemology::Polyglot::Language::Python::Python3Point12 => {
        language: 'python',
        version: '3.12',
        filename: 'main.py'
      }
    }
  end
end
# rubocop:enable Metrics/ModuleLength
