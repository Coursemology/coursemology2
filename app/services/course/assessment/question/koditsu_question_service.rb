# frozen_string_literal: true
class Course::Assessment::Question::KoditsuQuestionService
  include Course::Assessment::Question::KoditsuQuestionConcern

  def initialize(question, workspace_id, meta, course)
    # TODO: support file upload (image) if the question set includes image
    @question = question
    @workspace_id = workspace_id
    @type = @question.language.type.constantize
    @course = course

    set_time_limits
    @metadata = meta[:data]
    build_all_test_cases

    @question_object = build_question_object
  end

  def run_create_koditsu_question
    new_question_object = @question_object.merge({
      workspaceId: @workspace_id
    })

    koditsu_api_service = KoditsuAsyncApiService.new('api/question/coding', new_question_object)
    response_status, response_body = koditsu_api_service.post

    if response_status == 201
      [response_status, response_body['data']]
    else
      [response_status, nil]
    end
  end

  def run_edit_koditsu_question(id)
    koditsu_api_service = KoditsuAsyncApiService.new("api/question/coding/#{id}", @question_object)
    response_status, = koditsu_api_service.put

    response_status
  end

  private

  def set_time_limits
    @time_limit = @question.time_limit || @course.programming_max_time_limit.to_i
    @time_limit_ms = @time_limit * 1000
  end

  def build_all_test_cases
    @test_cases = []
    build_test_cases(@metadata['test_cases']['public'])
    build_test_cases(@metadata['test_cases']['private'])
    build_test_cases(@metadata['test_cases']['evaluation'])
  end

  def build_test_cases(test_cases)
    test_cases.each do |testcase|
      @test_cases << {
        index: @test_cases.length + 1,
        timeout: @time_limit_ms,
        hint: testcase['hint'],
        prefix: '',
        lhsExpression: testcase['expression'],
        rhsExpression: testcase['expected'],
        display: testcase['expression']
      }
    end
  end

  def build_question_object
    {
      title: @question.title,
      description: @question.description,
      resources: [{
        languageVersions: {
          language: koditsu_programming_language_map[@type][:language],
          versions: [koditsu_programming_language_map[@type][:version]]
        },
        templates: [{
          path: koditsu_programming_language_map[@type][:filename],
          content: @metadata['submission'],
          prefix: @metadata['prepend'],
          suffix: koditsu_programming_language_map[@type][:language] == 'cpp' ? '' : @metadata['append']
        }],
        exprTestcases: @test_cases
      }]
    }
  end
end
