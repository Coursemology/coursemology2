# frozen_string_literal: true
class Course::ExperiencePointsRecordsController < Course::ComponentController
  load_resource :course_user, through: :course, id_param: :user_id, except: [:index, :download]
  load_and_authorize_resource :experience_points_record, through: :course_user,
                                                         class: 'Course::ExperiencePointsRecord',
                                                         except: [:index, :download]

  def index
    authorize!(:read_exp, @course)
    load_active_experience_points_records
    paginate_and_preload_experience_points
    preload_exp_points_updater
  end

  def show
    paginate_and_preload_experience_points
    preload_exp_points_updater
  end

  def download
    authorize!(:download_exp_csv, @course)
    job = Course::ExperiencePointsDownloadJob.
          perform_later(current_course, filter_download_params[:student_id]).job

    render partial: 'jobs/submitted', locals: { job: job }
  end

  def update
    if @experience_points_record.update(experience_points_record_params)
      course_user = CourseUser.find_by(course: current_course, id: @experience_points_record.updater)
      user = course_user || @experience_points_record.updater

      render json: { id: @experience_points_record.id,
                     reason: { text: @experience_points_record.reason },
                     pointsAwarded: @experience_points_record.points_awarded,
                     updatedAt: @experience_points_record.updated_at,
                     updater: { id: user.id, name: user.name,
                                userUrl: url_to_user_or_course_user(current_course, user) } }, status: :ok
    else
      render json: { errors: @experience_points_record.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @experience_points_record.destroy
      head :ok
    else
      render json: { errors: @experience_points_record.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def load_active_experience_points_records
    course_user_id = filter_download_params[:student_id] || @course.course_users.pluck(:id)
    @experience_points_records = Course::ExperiencePointsRecord.where(course_user_id: course_user_id).active
  end

  def experience_points_record_params
    params.require(:experience_points_record).permit(:points_awarded, :reason)
  end

  def filter_and_paginate_params
    return {} if params[:filter].blank?

    params[:filter].permit(:page_num, :student_id)
  end

  def filter_download_params
    return {} if params[:filter].blank?

    params[:filter].permit(:student_id)
  end

  def paginate_and_preload_experience_points
    @experience_points_count = @experience_points_records.active.count
    @experience_points_records = @experience_points_records.active.
                                 order(updated_at: :desc).paginated(filter_and_paginate_params)
    @experience_points_records = @experience_points_records.preload([{ actable: [:assessment, :survey] }, :updater])
  end

  def preload_exp_points_updater
    updater_ids = @experience_points_records.pluck(:updater_id)
    @updater_preload_service = Course::CourseUserPreloadService.new(updater_ids, current_course)
  end

  # @return [Course::ExperiencePointsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_experience_points_component]
  end
end
