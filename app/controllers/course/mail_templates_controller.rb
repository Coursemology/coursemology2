class Course::MailTemplatesController < Course::ModuleController
  load_and_authorize_resource :mail_template, through: :course, class: Course::MailTemplate.name
  rescue_from ActiveRecord::RecordInvalid, with: :validation_failed

  def index #:nodoc:
    scope = customized_mail_actions(@course)
    @viewing_option = params[:mail_action] || (scope.first && scope.first[1])
    @mail_template =
      @course.mail_templates.where(action: Course::MailTemplate.actions[@viewing_option]).first
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    @mail_template.save!
    redirect_to course_mail_templates_path(@course, mail_action: @mail_template.action),
      flash: notice
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    flash_notice = notice
    @mail_template.update_attributes!(mail_template_params)
    redirect_to course_mail_templates_path(@course, mail_action: @mail_template.action),
      flash: flash_notice
  end

  def destroy #:nodoc:
    flash_notice = notice
    @mail_template.destroy!
    redirect_to course_mail_templates_path(@course), flash: flash_notice
  end

  def customized_mail_actions(course)
    course.mail_templates.map do |template|
      action = template.action
      [t("course.mail_templates.action.#{action}"), action]
    end
  end
  helper_method :customized_mail_actions

  def noncustomized_mail_actions(course)
    (Course::MailTemplate.actions.keys - course.mail_templates.map { |template| template.action }).
      map { |action| [t("course.mail_templates.action.#{action}"), action] }
  end
  helper_method :noncustomized_mail_actions

  private

  def mail_template_params #:nodoc:
    params.require(:course_mail_template).
      permit(:course_id, :subject, :pre_message, :post_message, :action)
  end

  def notice
    {
      notice: t('.notice_format', raise: true) %
      { action: t("course.mail_templates.action.#{@mail_template.action}", raise: true) }
    }
  end

  def error(reason)
    { error: t('.error_format', raise: true) % { reason: reason } }
  end

  def validation_failed(exception)
    redirect_to :back, flash: error(exception.message)
  rescue ActionController::RedirectBackError
    redirect_to root_path, flash: error(exception.message)
  end
  end