# frozen_string_literal: true
module Course::Assessment::KoditsuAssessmentConcern
  extend ActiveSupport::Concern

  def create_assessment_in_koditsu
    workspace_id = current_course.koditsu_workspace_id

    monitoring_object, seb_config_key = monitoring_configuration

    assessment_service = Course::Assessment::KoditsuAssessmentService.
                         new(@assessment, [], workspace_id, monitoring_object, seb_config_key)
    status, response = assessment_service.run_create_koditsu_assessment

    if status == 201
      @assessment.update!({
        is_synced_with_koditsu: true,
        koditsu_assessment_id: response['id']
      })
    else
      @assessment.update!(is_synced_with_koditsu: false)
    end
  end

  def update_assessment_in_koditsu
    assessment_id = @assessment.koditsu_assessment_id

    get_question_status, questions = questions_in_koditsu(assessment_id)

    unless get_question_status == 200
      raise KoditsuError,
            { status: get_question_status, body: questions }
    end

    existing_questions_hash = @assessment.questions.
                              select(&:koditsu_question_id).
                              to_h { |question| [question.koditsu_question_id, true] }

    new_questions = questions.filter do |question|
      existing_questions_hash[question['id']]
    end

    status = edit_koditsu_assessment(@assessment, new_questions, current_course, monitoring_configuration)

    @assessment.update!(is_synced_with_koditsu: status == 200)
  end

  def create_or_update_assessment_in_koditsu
    if @assessment.koditsu_assessment_id
      update_assessment_in_koditsu
    else
      create_assessment_in_koditsu
    end
  end

  def remove_question_from_assessment_in_koditsu(question_id)
    assessment_id = @assessment.koditsu_assessment_id

    get_question_status, questions = questions_in_koditsu(assessment_id)
    return unless get_question_status == 200

    new_questions = questions.reject do |question|
      question['id'] == question_id
    end

    status = edit_koditsu_assessment(@assessment, new_questions, current_course, monitoring_configuration)

    return unless status == 200 && @assessment.questions.reload.all?(&:is_synced_with_koditsu)

    @assessment.update!(is_synced_with_koditsu: true)
  end

  def questions_in_koditsu(koditsu_assessment_id)
    service = KoditsuAsyncApiService.new("api/assessment/#{koditsu_assessment_id}", nil)
    status, response = service.get

    if status == 200
      [status, response['data']['questions']]
    else
      [status, nil]
    end
  end

  def monitoring_configuration
    if @assessment.monitor_id
      monitoring = @assessment.monitor
      monitoring_object = {
        heartbeatIntervalMs: monitoring.max_interval_ms,
        isEnabled: monitoring.enabled
      }

      is_using_seb = @assessment.monitor.browser_authorization? &&
                     @assessment.monitor.browser_authorization_method == 'seb_config_key'
      seb_config_key = is_using_seb ? @assessment.monitor.seb_config_key : nil
    else
      monitoring_object = {
        heartbeatIntervalMs: 0,
        isEnabled: false
      }
      seb_config_key = nil
    end

    [monitoring_object, seb_config_key]
  end

  def edit_koditsu_assessment(assessment, questions, course, monitoring_config)
    assessment_id = assessment.koditsu_assessment_id
    workspace_id = course.koditsu_workspace_id
    monitoring_object, seb_config_key = monitoring_config

    service = Course::Assessment::KoditsuAssessmentService.
              new(assessment, questions, workspace_id, monitoring_object, seb_config_key)
    status, = service.run_edit_koditsu_assessment(assessment_id)

    status
  end
end
