class Course::Assessment::CategoriesController < Course::Assessment::Controller
  load_and_authorize_resource :category, through: :course,
                              through_association: :assessment_categories,
                              class: Course::Assessment::Category.name
  add_breadcrumb :admin, :course_admin_path
  add_breadcrumb :index, :course_admin_categories_path


  def new
  end

  def create
    if @category.save
      redirect_to(course_admin_categories_path(current_course, @category),
                  success: t('.success', title: @category.title))
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @category.update_attributes(category_params)
      redirect_to(course_admin_categories_path(current_course),
                  success: t('.success', title: @category.title))
    else
      render 'edit'
    end
  end

  def destroy
    if @category.destroy
      redirect_to(course_admin_categories_path(current_course),
                  success: t('.success', title: @category.title))
    else
      redirect_to course_admin_categories_path(current_course),
                  danger: @category.errors.full_messages.to_sentence
    end
  end

  private

  def category_params
    params.require(:assessment_category).permit(:title, :weight)
  end
end
