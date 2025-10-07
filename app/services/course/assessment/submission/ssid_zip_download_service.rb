# frozen_string_literal: true
class Course::Assessment::Submission::SsidZipDownloadService < Course::Assessment::Submission::BaseZipDownloadService
  SSID_MAX_ZIP_FILE_SIZE = 8.megabytes

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

  # TODO: Move this mapping to polyglot repository.
  # C# and R are not yet supported by SSID, so they are excluded.
  FILE_EXTENSION_MAPPER = {
    Coursemology::Polyglot::Language::CPlusPlus::CPlusPlus11 => '.cpp',
    Coursemology::Polyglot::Language::CPlusPlus::CPlusPlus17 => '.cpp',
    Coursemology::Polyglot::Language::Go::Go1Point16 => '.go',
    Coursemology::Polyglot::Language::Java::Java11 => '.java',
    Coursemology::Polyglot::Language::Java::Java17 => '.java',
    Coursemology::Polyglot::Language::Java::Java21 => '.java',
    Coursemology::Polyglot::Language::Java::Java8 => '.java',
    Coursemology::Polyglot::Language::JavaScript::JavaScript22 => '.js',
    Coursemology::Polyglot::Language::Python::Python2Point7 => '.py',
    Coursemology::Polyglot::Language::Python::Python3Point10 => '.py',
    Coursemology::Polyglot::Language::Python::Python3Point12 => '.py',
    Coursemology::Polyglot::Language::Python::Python3Point13 => '.py',
    Coursemology::Polyglot::Language::Python::Python3Point4 => '.py',
    Coursemology::Polyglot::Language::Python::Python3Point5 => '.py',
    Coursemology::Polyglot::Language::Python::Python3Point6 => '.py',
    Coursemology::Polyglot::Language::Python::Python3Point7 => '.py',
    Coursemology::Polyglot::Language::Python::Python3Point9 => '.py',
    Coursemology::Polyglot::Language::Rust::Rust1Point68 => '.rs',
    Coursemology::Polyglot::Language::TypeScript::TypeScript5Point8 => '.ts'
  }.freeze

  def initialize(assessment)
    super()
    @assessment = assessment
    @questions = assessment.questions.to_h { |q| [q.id, q] }
  end

  # Downloads each submission to its own folder in the base directory.
  def download_to_base_dir
    submissions = @assessment.submissions.confirmed.by_users(course_user_ids(@assessment)).
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

      question_assessment = @assessment.question_assessments.find_by!(question: question)
      question_dir = create_folder(skeleton_dir, question_assessment.display_title)
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
      ensure_file_extension(answer_dir, answer.question)
    end
  end

  def ensure_file_extension(answer_dir, question)
    return unless question.specific.is_a?(Course::Assessment::Question::Programming)

    file_extension = FILE_EXTENSION_MAPPER[question.specific.language.class]
    return unless file_extension

    Dir["#{answer_dir}/**/**"].each do |file|
      next unless File.file?(file)

      new_file = "#{File.dirname(file)}/#{File.basename(file, '.*')}#{file_extension}"
      File.rename(file, new_file) if file != new_file
    end
  end

  def answer_size_hash
    answers_to_zip = Dir.children(@base_dir).map { |child| File.join(@base_dir, child) }

    answers_to_zip.map do |answer_dir|
      answer_size = if File.directory?(answer_dir)
                      Dir["#{answer_dir}/**/**"].select { |f| File.file?(f) }.sum { |f| File.size(f) }
                    else
                      File.size(answer_dir)
                    end
      [answer_dir, answer_size]
    end.to_h
  end

  def partition_answers_by_size(answer_sizes)
    answer_partitions = []
    current_partition = []
    current_partition_size = 0

    answer_sizes.each do |answer_dir, answer_size|
      if current_partition_size + answer_size > SSID_MAX_ZIP_FILE_SIZE && !current_partition.empty?
        answer_partitions << current_partition
        current_partition = [answer_dir]
        current_partition_size = answer_size
      else
        current_partition << answer_dir
        current_partition_size += answer_size
      end
    end
    answer_partitions << current_partition
    answer_partitions
  end

  # Zip the directory and write to the file.
  #
  # @return [Array] The paths to the zip files.
  def zip_base_dir
    answer_partitions = partition_answers_by_size(answer_size_hash)
    answer_partitions.map.with_index do |partition, index|
      output_file = "#{@base_dir}_#{index}.zip"
      Zip::File.open(output_file, Zip::File::CREATE) do |zip_file|
        partition.each do |answer_dir|
          Dir["#{answer_dir}/**/**"].each do |file|
            zip_file.add(file.sub(File.join("#{@base_dir}/"), ''), file)
          end
        end
      end
      output_file
    end
  end

  def course_user_ids(assessment)
    assessment.course.course_users.students.without_phantom_users.select(:user_id)
  end
end
