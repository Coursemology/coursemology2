# frozen_string_literal: true
class Course::Assessment::KoditsuAssessmentService
  def initialize(assessment, questions, workspace_id, monitoring_object, seb_config_key)
    @assessment = assessment
    @workspace_id = workspace_id
    @seb_config_key = seb_config_key

    default_duration = ((Time.at(@assessment.end_at) - Time.at(@assessment.start_at)) / 60).to_i
    @assessment_object = {
      title: @assessment.title,
      description: @assessment.description,
      schedule: {
        validity: {
          startAt: @assessment.start_at,
          endAt: @assessment.end_at
        },
        duration: @assessment.time_limit || default_duration
      },
      questions: questions
    }

    extend_assessment_object_with_monitoring_object(monitoring_object)
  end

  def run_create_koditsu_assessment
    new_assessment_object = @assessment_object.merge({
      workspaceId: @workspace_id
    })

    koditsu_api_service = KoditsuAsyncApiService.new('api/assessment', new_assessment_object)
    response_status, response_body = koditsu_api_service.post

    if response_status == 201
      [response_status, response_body['data']]
    else
      [response_status, nil]
    end
  end

  def run_edit_koditsu_assessment(id)
    koditsu_api_service = KoditsuAsyncApiService.new("api/assessment/#{id}", @assessment_object)
    response_status, response_body = koditsu_api_service.put

    if response_status == 200
      [response_status, response_body['data']]
    else
      [response_status, nil]
    end
  end

  def extend_assessment_object_with_monitoring_object(monitoring_object)
    return unless @assessment.view_password_protected?

    @assessment_object = @assessment_object.merge({
      examControl: {
        passwords: {
          assessmentPassword: @assessment.view_password,
          sessionPassword: @assessment.session_password
        },
        monitoring: monitoring_object
      }
    })

    return unless @seb_config_key

    @assessment_object[:examControl] = @assessment_object[:examControl].merge({
      seb: {
        configKey: @seb_config_key
      }
    })
  end
end
