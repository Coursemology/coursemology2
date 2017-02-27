# frozen_string_literal: true
class System::Admin::LecturesController < System::Admin::Controller
  load_and_authorize_resource :lecture, class: System::Lecture.name
  add_breadcrumb :index, :admin_lectures_path

  def index
    @lectures = @lectures.includes(:creator).ordered_by_date.page(page_param)
  end

  def new
  end

  def create
    if @lecture.save
      redirect_to admin_lectures_path,
                  success: t('.success', title: @lecture.title)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @lecture.update_attributes(lecture_params)
      redirect_to admin_lectures_path,
                  success: t('.success', title: @lecture.title)
    else
      render 'edit'
    end
  end

  def destroy
    if @lecture.destroy
      redirect_to admin_lectures_path,
                  success: t('.success',
                             title: @lecture.title)
    else
      redirect_to admin_lectures_path,
                  danger: t('.failure', error: @lecture.errors.full_messages.to_sentence)
    end
  end

  private

  def lecture_params
    params.require(:system_lecture).permit(:title, :content, :start_at, :end_at)
  end
end