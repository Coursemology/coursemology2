class Course::EnrolRequestsController < Course::ModuleController
  load_and_authorize_resource :enrol_request, through: :course

  def index #:nodoc:
    @staff_requests = @enrol_requests.staff
    @student_requests = @enrol_requests.student

    respond_to do |format|
      format.html
      format.json do
        def get_request_hash(requests)
          result = []
          requests.each do |request|
            request_hash = request.as_json(include: {user: {only: [:name, :email]}})
            request_hash[:path] = course_enroll_request_path(@course, request.id, 'json')
            result << request_hash
          end
          result
        end

        staff_request_hashes = get_request_hash(@staff_requests)
        student_request_hashes = get_request_hash(@student_requests)
        response_hash = {staff_requests: staff_request_hashes, student_requests: student_request_hashes}
        render json: response_hash
      end
    end
  end

  def new
    unless current_user
      redirect_to new_user_session_path
      return
    end
    unless @course.is_open?
      redirect_to course_path(@course)
      return
    end

    existing = EnrollRequest.find_by_instance_user_id_and_course_id(current_user.id, @course.id)
    if !current_course_user && !existing
      if CourseUser.roles.include?(params[:role])
        @enrol_request.role = params[:role]
      else
        @enrol_request.role = :student
      end

      @enrol_request.course = @course
      @enrol_request.user = current_user
      @enrol_request.role = @role
      @enrol_request.save
      # TODO notify lecturer
    end
  end
end
