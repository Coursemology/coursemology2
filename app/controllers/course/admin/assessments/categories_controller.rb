class Course::Admin::Assessments::CategoriesController < Course::Admin::Controller
  load_and_authorize_resource :category,
                              through: :course,
                              through_association: :assessment_categories,
                              class: Course::Assessment::Category.name
  add_breadcrumb :index, :course_admin_assessments_path

  def new
  end

  def create
    if @category.save
      redirect_to course_admin_assessments_path(current_course),
                  success: t('.success', title: @category.title)
    else
      render 'new'
    end
  end

  def destroy
    if @category.destroy
      redirect_to course_admin_assessments_path(current_course),
                  success: t('.success', title: @category.title)
    else
      redirect_to course_admin_assessments_path(current_course),
                  danger: t('.failure', title: @category.errors.full_messages.to_sentence)
    end
  end

  private

  def category_params
    params.require(:category).permit(:title, :weight)
  end
end
