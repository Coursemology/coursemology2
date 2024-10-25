# frozen_string_literal: true
class Course::Assessment::Question::Controller < Course::Assessment::ComponentController
  include Course::Assessment::KoditsuAssessmentConcern
  before_action :authorize_assessment
  before_action :authorize_create_question_in_koditsu, only: [:new, :create]

  after_action :flag_not_synced_with_koditsu, only: [:create, :update]

  # Use method to build new questions.
  #
  # Cancancan uses `assessment.specific_questions.build` to build a resource, which will break since the specific
  # questions are nested through `question_assessments` and AR does not support build associations with nested
  # has_many through.
  def self.build_and_authorize_new_question(question_name, options)
    before_action only: options[:only], except: options[:except] do
      question = options[:class].new
      @question_assessment = question.question_assessments.build(assessment: @assessment)
      if action_name != 'new'
        question_params = send("#{question_name}_params")
        @question_assessment.skill_ids = question_params[:question_assessment].try(:[], :skill_ids)
        question.assign_attributes(question_params.except(:question_assessment))
      end
      authorize!(action_name.to_sym, question)
      instance_variable_set("@#{question_name}", question) unless instance_variable_get("@#{question_name}")
    end
  end

  def authorize_create_question_in_koditsu
    return if instance_of?(Course::Assessment::Question::ProgrammingController)

    is_course_koditsu_enabled = current_course.component_enabled?(Course::KoditsuPlatformComponent)
    raise CanCan::AccessDenied if @assessment.is_koditsu_enabled && is_course_koditsu_enabled
  end

  def flag_not_synced_with_koditsu
    return unless instance_of?(Course::Assessment::Question::ProgrammingController)

    question = @programming_question.acting_as

    question.update!(is_synced_with_koditsu: false)
  end

  def load_question_assessment_for(question)
    @assessment.question_assessments.find_by!(question: question.acting_as)
  end

  def update_skill_ids_if_params_present(question_assessment_params)
    skill_ids_params = question_assessment_params[:skill_ids] unless question_assessment_params[:skill_ids].nil?
    @question_assessment.skill_ids = skill_ids_params unless skill_ids_params.nil?
  end

  def destroy
    flag_assessment_not_synced_with_koditsu
  end

  protected

  def authorize_assessment
    authorize!(:update, @assessment)
  end
end
