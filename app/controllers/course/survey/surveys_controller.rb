# frozen_string_literal: true
class Course::Survey::SurveysController < Course::Survey::Controller
  include Course::Survey::ReorderingConcern

  skip_load_and_authorize_resource :survey, only: [:new, :create]
  build_and_authorize_new_lesson_plan_item :survey, class: Course::Survey, through: :course, only: [:new, :create]

  COURSE_USERS = { my_students: 'my_students',
                   my_students_w_phantom: 'my_students_w_phantom',
                   students: 'students',
                   students_w_phantom: 'students_w_phantom' }.freeze

  def index
    @surveys = @surveys.includes(responses: { experience_points_record: :course_user })
    preload_student_submitted_responses_counts
  end

  def create
    if @survey.save
      render partial: 'survey', locals: { survey: @survey, survey_time: @survey.time_for(current_course_user) }
    else
      render json: { errors: @survey.errors }, status: :bad_request
    end
  end

  def show
    render_survey_with_questions_json
  end

  def update
    if @survey.update(survey_params)
      render_survey_with_questions_json
    else
      render json: { errors: @survey.errors }, status: :bad_request
    end
  end

  def destroy
    if @survey.destroy
      head :ok
    else
      head :bad_request
    end
  end

  def results
    @my_students = current_course_user.try(:my_students) || []
    preload_questions_results
  end

  def remind
    authorize!(:manage, @survey)
    return head :bad_request unless student_course_users

    Course::Survey::ReminderService.
      send_closing_reminder(
        @survey,
        student_course_users.pluck(:id),
        include_unsubscribed: true
      )
    head :ok
  end

  def download
    authorize!(:manage, @survey)
    job = Course::Survey::SurveyDownloadJob.
          perform_later(@survey).job
    respond_to do |format|
      format.json { render partial: 'jobs/submitted', locals: { job: job } }
    end
  end

  private

  def student_course_users
    case params[:course_users]
    when COURSE_USERS[:my_students]
      current_course_user.my_students.without_phantom_users
    when COURSE_USERS[:my_students_w_phantom]
      current_course_user.my_students
    when COURSE_USERS[:students_w_phantom]
      @survey.course.course_users.students
    when COURSE_USERS[:students]
      @survey.course.course_users.students.without_phantom_users
    else
      false
    end
  end

  def render_survey_with_questions_json
    load_sections
    render partial: 'survey_with_questions', locals: {
      survey: @survey,
      survey_time: @survey.time_for(current_course_user)
    }
  end

  def preload_questions_results
    @sections ||= @survey.sections.includes(
      questions: {
        options: { attachment_references: :attachment },
        answers: [{ response: { experience_points_record: :course_user } }, :options]
      }
    )
  end

  def survey_params
    fields = [
      :title, :description, :base_exp, :time_bonus_exp, :start_at, :bonus_end_at, :end_at,
      :published, :allow_response_after_end, :allow_modify_after_submit, :has_todo
    ]
    fields << :anonymous if action_name == 'create' || @survey.can_toggle_anonymity?
    params.require(:survey).permit(*fields)
  end

  def preload_student_submitted_responses_counts
    @student_submitted_responses_counts_hash = @surveys.calculated(:student_submitted_responses_count).to_h do |survey|
      [survey.id, survey.student_submitted_responses_count]
    end
  end
end
