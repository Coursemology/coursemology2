# frozen_string_literal: true
namespace :db do
  task update_annotation_line: :environment do
    Rails.application.eager_load!

    require 'action_view'
    require 'action_view/helpers'

    helper = HelperContext.new

    start_date_input, end_date_input = ENV['START_DATE'], ENV['END_DATE']
    unless start_date_input && end_date_input
      puts 'Please provide START_DATE and END_DATE to execute this script'
      exit
    end

    start_date = Date.parse(start_date_input)
    end_date = Date.parse(end_date_input)

    if start_date > end_date
      puts 'START_DATE should be earlier than END_DATE'
      exit
    end

    ActsAsTenant.without_tenant do
      conn = ActiveRecord::Base.connection
      start_time = Time.now

      annotation_id__file_id__line_num = conn.exec_query(<<-SQL)
        SELECT
          DISTINCT(annotations.id),
          annotations.file_id,
          annotations.line
        FROM course_assessment_answer_programming_file_annotations AS annotations
        JOIN course_assessment_answer_programming_files AS files
          ON annotations.file_id = files.id
        JOIN course_assessment_answers AS answers
          ON files.answer_id = answers.actable_id
          AND answers.actable_type = 'Course::Assessment::Answer::Programming'
          AND CAST(answers.created_at AS DATE) BETWEEN '#{start_date}' AND '#{end_date}'
        JOIN course_discussion_topics AS topics
          ON annotations.id = topics.actable_id
          AND topics.actable_type = 'Course::Assessment::Answer::ProgrammingFileAnnotation'
        JOIN course_discussion_posts AS posts
          ON posts.topic_id = topics.id
      SQL

      end_time = Time.now
      puts "1st sql for #{annotation_id__file_id__line_num.rows.length} annotations = #{end_time - start_time} seconds"
      start_time = Time.now

      file_annotation_lines = Hash.new { |hash, key| hash[key] = [] }
      file_annotation_ids = Hash.new { |hash, key| hash[key] = [] }

      annotation_id__file_id__line_num.rows.each do |row|
        annotation_id, file_id, line_num = row
        file_annotation_lines[file_id] << line_num
        file_annotation_ids[file_id] << annotation_id
      end

      # Extract distinct file_id values from the file_annotation_lines hash
      file_ids = file_annotation_lines.keys

      end_time = Time.now
      puts "extract file info = #{end_time - start_time} seconds"
      start_time = Time.now

      files = conn.exec_query(<<-SQL)
        SELECT files.id, files.content, programming_questions.language_id
        FROM course_assessment_answer_programming_files AS files
        JOIN course_assessment_answers AS answers
          ON files.answer_id = answers.actable_id
          AND answers.actable_type = 'Course::Assessment::Answer::Programming'
        JOIN course_assessment_questions AS questions
          ON answers.question_id = questions.id
        JOIN course_assessment_question_programming as programming_questions
          ON questions.actable_id = programming_questions.id
        WHERE files.id IN (#{file_ids.join(', ')})
      SQL

      end_time = Time.now
      puts "2nd sql for #{file_ids.length} file contents = #{end_time - start_time} seconds"

      start_time = Time.now

      files_hash = files.rows.map { |row| { id: row[0], content: row[1], language_id: row[2] } }

      language_ids = files_hash.map { |file| file[:language_id] }.uniq
      languages = Coursemology::Polyglot::Language.where(id: language_ids).index_by(&:id)

      annotation_ids_to_update = []

      files_hash.each do |file|
        content = file[:content]
        language = languages[file[:language_id]]

        highlighted_code = helper.highlight_code_block(content, language)

        # skip to next unless new lines were inserted by application
        next unless lines_are_added(highlighted_code)

        annotation_lines = file_annotation_lines[file[:id]]
        smallest_decrementable_number = smallest_decrementable_line_number(annotation_lines)

        # if all the annotations in the file is consecutive from line 1, skip this file
        next if smallest_decrementable_number == annotation_lines.length + 1

        annotation_ids = file_annotation_ids[file[:id]]
        annotation_line_to_annotation_id = annotation_lines.zip(annotation_ids).to_h
        annotation_lines.each do |line|
          # only decrement line that is after the smallest decrementable number
          # and also if there is no annotation in the line directly preceding that
          next if line <= smallest_decrementable_number

          annotation_id = annotation_line_to_annotation_id[line]
          annotation_ids_to_update << annotation_id
        end
      end

      end_time = Time.now
      puts "processing = #{end_time - start_time} seconds"

      start_time = Time.now
      # rewrite to not so long
      Course::Assessment::Answer::ProgrammingFileAnnotation.
        where(id: annotation_ids_to_update).
        update_all('line = line - 1')
      puts "updating = #{end_time - start_time} seconds"

      puts annotation_ids_to_update.length
    end
  end
end

# in our previous HTML Pipeline (using RougeFilter and PreformattedLineSplitFilter), some of the codes
# are unintentionally added 1 line on the FE while displaying, and all such files have the criteria
# that the processed code is always started with <div class=highlight codehilite-*>\n<
def lines_are_added(highlighted_code)
  pattern = /\A<div class=.*>\n<span/
  highlighted_code.match?(pattern)
end

# if we have annotations on line [1, 2, 3, 7, 8, 9], for example, we need to still decrement
# the line 7-9. Therefore, we need to find the smallest line number in which decrement can
# occur. The result should be inside the range of 1 and the length of the array
# if the result is more than that, it means no annotation line numbers can be decremented.
def smallest_decrementable_line_number(line_numbers)
  max_smallest = line_numbers.length + 1
  number_exist_in_array = {}

  line_numbers.each do |num|
    number_exist_in_array[num] = true
  end

  (1..max_smallest).find { |num| !number_exist_in_array.key?(num) }
end

class HelperContext
  require Rails.root.join('app/helpers/application_html_formatters_helper')

  include ApplicationHTMLFormattersHelper
  include ActionView::Helpers::TagHelper
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::OutputSafetyHelper
  include ERB::Util

  attr_accessor :output_buffer

  def initialize
    @output_buffer = ActiveSupport::SafeBuffer.new
  end
end
