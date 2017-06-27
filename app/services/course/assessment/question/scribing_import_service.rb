# frozen_string_literal: true
# Imports new pdf files, splits and processes the files and creates scribing questions for each
# page of the PDF file.
class Course::Assessment::Question::ScribingImportService
  # Creates a new service import object.
  #
  # @params [Hash] params The params received by the controller for importing the scribing question.
  def initialize(params)
    @params = params[:question_scribing]
    @assessment_id = params[:assessment_id]
  end

  # Imports and saves the provided PDF as a scribing question.
  #
  # @return [Boolean] True if the pdf is processed and successfully saved, otherwise false. Note
  #   that if the save is unsuccessful, all questions are not persisted.
  def save
    return_value = true
    Course::Assessment::Question::Scribing.transaction do
      build_scribing_questions(generate_pdf_files).each do |question|
        unless question.save
          return_value = false
          raise ActiveRecord::Rollback
        end
      end
    end
    return_value
  end

  private

  # Generated an array of PDF files based on files provided in the params. This file is
  # split up into smaller files based on the number of pages.
  #
  # @return [Array<ActionDispatch::Http::UploadedFile>] Array of processed files.
  def generate_pdf_files
    file = @params[:file]
    filename = parse_filename(file)

    MiniMagick::Image.new(file.tempfile.path).pages.each_with_index.map do |page, index|
      temp_name = "#{filename}[#{index + 1}].png"
      temp_file = Tempfile.new([temp_name, '.png'])
      process_pdf(page.path, temp_file.path)

      # Leave filename sanitization to attachment reference
      ActionDispatch::Http::UploadedFile.
        new(tempfile: temp_file, filename: temp_name.dup, type: 'image/png')
    end
  end

  # Process the PDF given the image path, with the new_name as the new file name.
  #
  # @param [String] image_path
  # @param [String] new_image_path File path of newly processed file
  def process_pdf(image_path, new_image_path)
    MiniMagick::Tool::Convert.new do |convert|
      convert.render
      convert.density(300)
      # TODO: Check to resize image first or later
      convert.background('white')
      convert.flatten
      convert << image_path
      convert << new_image_path
    end
  end

  # Builds and returns an array of scribing questions based on the files provided.
  #
  # @param [Array<ActionDispatch::Http::UploadedFile>] files An array of processed files to be
  #   persisted as scribing questions.
  # @return [Array<Course::Assessment::Question::Scribing>] Array of non-persisted scribing
  #   questions.
  def build_scribing_questions(files)
    next_weight = max_weight ? max_weight + 1 : 0
    files.map.with_index(next_weight) do |file, weight|
      build_scribing_question(weight).tap do |question|
        question.build_attachment(attachment: Attachment.find_or_create_by(file: file),
                                  name: file.original_filename)
      end
    end
  end

  # Builds a new scribing question given the +@question+ instance varible.
  #
  # @param [Fixnum] weight Weight to be assigned to the scribing question
  # @return [Course::Assessment::Question::Scribing] New scribing that is not persisted.
  def build_scribing_question(weight)
    Course::Assessment::Question::Scribing.new(
      title: @params[:title],
      description: @params[:description],
      maximum_grade: @params[:maximum_grade],
      assessment_id: @assessment_id,
      weight: weight
    )
  end

  # Returns the maximum weight of the questions for the current assessment.
  #
  # @return [Fixnum] Maximum weight of the questions for the current assessment.
  def max_weight
    Course::Assessment.find(@assessment_id).questions.pluck(:weight).max
  end

  # Parses the based filename of the given file.
  # This method also substitutes whitespaces for underscore in the filename.
  #
  # @param [File] The provided file
  # @return [String] The parsed filename.
  def parse_filename(file)
    File.basename(file.original_filename, '.pdf').tr(' ', '_')
  end
end
