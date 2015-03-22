class Course::MailTemplatesController < Course::ModuleController
  load_and_authorize_resource :mail_template, through: :course, class: Course::MailTemplate.name

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
    @mail_template.update_attributes(mail_template_params)
    redirect_to edit_course_mail_template_path(@course, @mail_template), flash: notice
  end

  def destroy #:nodoc:
    flash_notice = notice
    @mail_template.destroy!
    redirect_to course_mail_templates_path(@course), flash: flash_notice
  end

  private

  def mail_template_params #:nodoc:
    params.require(:mail_template).permit(:course_id, :subject, :pre_message, :post_message)
  end

  def notice
    {
      notice: t('.notice_format') %
        { action: t("course.mail_templates.action.#{@mail_template.action}") }
    }
  end
end