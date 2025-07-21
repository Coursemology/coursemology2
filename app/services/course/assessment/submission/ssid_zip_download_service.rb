# frozen_string_literal: true
class Course::Assessment::Submission::SsidZipDownloadService < Course::Assessment::Submission::BaseZipDownloadService
  class << self
    # Downloads the submissions and zip them to upload to SSID.
    #
    # @param [Course::Assessment] assessment The main assessment for plagiarism check.
    # @return [String] The path to the zip file.
    def download_and_zip(assessment)
      service = new(assessment)
      service.download_and_zip
    end
  end

  private

  def initialize(assessment)
    super()
    @assessment = assessment
    @questions = assessment.questions.to_h { |q| [q.id, q] }
  end

  # Downloads each submission to its own folder in the base directory.
  def download_to_base_dir
    submissions = @assessment.submissions.by_users(course_user_ids(@assessment)).
                  includes(:answers, experience_points_record: :course_user)
    submissions.find_each do |submission|
      folder_name = "#{submission.id}_#{submission.course_user.name}"
      submission_dir = create_folder(@base_dir, folder_name)
      download_answers(submission, submission_dir)
    end
    create_skeleton_folder
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
                question.plagiarism_checkable?
              end
    answers.each do |answer|
      question_assessment = submission.assessment.question_assessments.
                            find_by!(question: @questions[answer.question_id])
      answer_dir = create_folder(submission_dir, question_assessment.display_title)
      answer.specific.download(answer_dir)
    end
  end

  def course_user_ids(assessment)
    assessment.course.course_users.students.without_phantom_users.select(:user_id)
  end
end
