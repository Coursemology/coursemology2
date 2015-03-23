class Course::MailTemplatesController < Course::ModuleController
  load_and_authorize_resource :mail_template, through: :course, class: Course::MailTemplate.name
  rescue_from ActiveRecord::RecordInvalid, with: :validation_failed

  def index #:nodoc:
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    @mail_template.save!
    redirect_to edit_course_mail_template_path(@course, @mail_template), flash: notice
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    flash_notice = notice
    @mail_template.update_attributes!(mail_template_params)
    redirect_to edit_course_mail_template_path(@course, @mail_template), flash: flash_notice
  end

  def destroy #:nodoc:
    flash_notice = notice
    @mail_template.destroy!
    redirect_to course_mail_templates_path(@course), flash: flash_notice
  end

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