# frozen_string_literal: true
class Course::Assessment::Submission::ZipDownloadService
  class << self
    # Downloads the submissions and zip them.
    #
    # @param [CourseUser] course_user The course user downloading the submissions.
    # @param [Course::Assessment] assessment The assessments to download submissions from.
    # @param [String|nil] course_users The subset of course users whose submissions to download.
    # Accepted values: 'my_students', 'my_students_w_phantom', 'students', 'students_w_phantom'
    #   'staff', 'staff_w_phantom'
    # # @param [Boolean] for_ssid_similarity_service Whether the zip is for ssid similarity service.
    # @return [String] The path to the zip file.
    def download_and_zip(course_user, assessment, course_users, for_ssid_similarity_service)
      service = new(course_user, assessment, course_users, for_ssid_similarity_service)
      service.download_and_zip
    end
  end

  def download_and_zip
    ActsAsTenant.without_tenant do
      download_to_base_dir
    end
    zip_base_dir
  end

  COURSE_USERS = { my_students: 'my_students',
                   my_students_w_phantom: 'my_students_w_phantom',
                   students: 'students',
                   students_w_phantom: 'students_w_phantom',
                   staff: 'staff',
                   staff_w_phantom: 'staff_w_phantom' }.freeze

  private

  def initialize(course_user, assessment, course_users, for_ssid_similarity_service)
    @course_user = course_user
    @assessment = assessment
    @questions = assessment.questions.to_h { |q| [q.id, q] }
    @course_users = course_users
    @for_ssid_similarity_service = for_ssid_similarity_service
    @base_dir = Dir.mktmpdir('coursemology-download-')
  end

  # Downloads each submission to its own folder in the base directory.
  def download_to_base_dir
    submissions = @assessment.submissions.by_users(course_user_ids).
                  includes(:answers, experience_points_record: :course_user)
    submissions.find_each do |submission|
      folder_name = if @for_ssid_similarity_service
                      "#{submission.id}_#{submission.course_user.name}"
                    else
                      submission.course_user.name
                    end
      submission_dir = create_folder(@base_dir, folder_name)
      download_answers(submission, submission_dir)
    end
    create_skeleton_folder if @for_ssid_similarity_service
  end

  # Downloads programming question template files to a 'skeleton' folder in the base directory.
  def create_skeleton_folder
    skeleton_dir = create_folder(@base_dir, 'skeleton')
    @questions.each_value do |question|
      next unless question.specific.is_a?(Course::Assessment::Question::Programming)

      question_dir = create_folder(skeleton_dir, question.question_assessments.first.display_title)
      programming_question = question.specific
      programming_question.template_files.each do |template_file|
        file_path = File.join(question_dir, template_file.filename)
        File.write(file_path, template_file.content)
      end
    end
  end

  # Downloads each answer to its own folder in the submission directory.
  def download_answers(submission, submission_dir)
    answers = submission.answers.includes(:question).latest_answers.
              select do |answer|
                question = @questions[answer.question_id]
                @for_ssid_similarity_service ? question.similarity_checkable? : question.files_downloadable?
              end
    answers.each do |answer|
      question_assessment = submission.assessment.question_assessments.
                            find_by!(question: @questions[answer.question_id])
      answer_dir = create_folder(submission_dir, question_assessment.display_title)
      answer.specific.download(answer_dir)
    end
  end

  def create_folder(parent, folder_name)
    normalized_name = Pathname.normalize_filename(folder_name)
    name_generator = FileName.new(File.join(parent, normalized_name),
                                  format: '(%d)', delimiter: ' ')
    name_generator.create.tap do |dir|
      Dir.mkdir(dir)
    end
  end

  # Zip the directory and write to the file.
  #
  # @return [String] The path to the zip file.
  def zip_base_dir
    output_file = "#{@base_dir}.zip"
    Zip::File.open(output_file, Zip::File::CREATE) do |zip_file|
      Dir["#{@base_dir}/**/**"].each do |file|
        zip_file.add(file.sub(File.join("#{@base_dir}/"), ''), file)
      end
    end

    output_file
  end

  def course_user_ids # rubocop:disable Metrics/AbcSize
    @course_user_ids ||=
      case @course_users
      when COURSE_USERS[:my_students]
        @course_user.my_students.without_phantom_users
      when COURSE_USERS[:my_students_w_phantom]
        @course_user.my_students
      when COURSE_USERS[:students_w_phantom]
        @assessment.course.course_users.students
      when COURSE_USERS[:staff]
        @assessment.course.course_users.staff.without_phantom_users
      when COURSE_USERS[:staff_w_phantom]
        @assessment.course.course_users.staff
      else
        @assessment.course.course_users.students.without_phantom_users
      end.select(:user_id)
  end
end
