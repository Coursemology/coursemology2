class Course::Assessment::AssessmentsController < Course::Assessment::Controller
  add_breadcrumb :index, :course_assessments_path
  before_action :load_assessment, only: [:index, :new, :create]
  load_resource :assessment, class: Course::Assessment.name, through: :course,
                             except: [:index, :new, :create]
  authorize_resource :assessment, class: Course::Assessment.name

  def index
  end

  def show
  end

  def new
  end

  def create
    if @assessment.save
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success', title: @assessment.title)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @assessment.update(assessment_params)
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success', title: @assessment.title)
    else
      render 'edit'
    end
  end

  def destroy
    if @assessment.destroy
      redirect_to course_assessments_path(current_course),
                  success: t('.success', assessment: @assessment.title)
    else
      redirect_to course_assessments_path(current_course),
                  danger: t('.failure', error: @assessment.errors.full_messages.to_sentence)
    end
  end

  protected

  def assessments_controller
    true
  end

  private

  def assessment_params
    params.require(:assessment).permit(:title, :description, :base_exp, :time_bonus_exp,
                                       :extra_bonus_exp, :start_time, :end_time, :bonus_end_time,
                                       :published)
  end

  def load_assessment
    load_tab

    case params[:action]
    when 'index'
      @assessments ||= @tab.assessments
    when 'new', 'create'
      @assessment ||= @tab.assessments.build(course: current_course)
      @assessment.assign_attributes(assessment_params) if params[:assessment]
    end
  end

  def load_tab
    # TODO: Implement tabs. This would be necessary so that we can list our assessments
    load_category
    @tab ||= @category.tabs.first
  end

  def load_category
    @category ||= current_course.assessment_categories.first ||
                  current_course.assessment_categories.new.tap do |c|
                    c.assign_attributes(title: t('course.assessment.assessments.index.header'),
                                        weight: 0)
                    c.tabs.build(title: t('course.assessment.assessments.index.header'), weight: 0)
                    c.save!
                  end
  end
end
