class Course::Admin::CategoriesController < Course::Admin::Controller
  load_and_authorize_resource :category, through: :course,
                              through_association: :assessment_categories,
                              class: Course::Assessment::Category.name
  add_breadcrumb :index, :course_admin_categories_path

  def index
  end

  def update
    if current_course.update_attributes(category_params)
      redirect_to course_admin_categories_path, success: t('.success')
    else
      redirect_to course_admin_categories_path, danger: t('.failure')
    end
  end

  private

  def category_params
    params.require(:course).permit(assessment_categories_attributes:
                                     [:id,:title, :weight,
                                      { tabs_attributes: [:id, :title, :weight, :category_id] }])
  end
end
