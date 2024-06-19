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

    start_time = Time.now

    ActsAsTenant.without_tenant do
      conn = ActiveRecord::Base.connection
      annotations_with_file_content = conn.exec_query(<<-SQL)
        SELECT
          DISTINCT(annotations.id),
          annotations.file_id,
          annotations.line,
          files.content,
          questions.actable_id
        FROM course_assessment_answer_programming_file_annotations AS annotations
        JOIN course_discussion_topics AS topics
          ON annotations.id = topics.actable_id
          AND topics.actable_type = 'Course::Assessment::Answer::ProgrammingFileAnnotation'
        JOIN course_discussion_posts AS posts
          ON posts.topic_id = topics.id
        JOIN course_assessment_answer_programming_files AS files
          ON annotations.file_id = files.id
        JOIN course_assessment_answers AS answers
          ON files.answer_id = answers.actable_id
          AND answers.actable_type = 'Course::Assessment::Answer::Programming'
          AND CAST(answers.created_at AS DATE) BETWEEN '#{start_date}' AND '#{end_date}'
        JOIN course_assessment_questions AS questions
          ON answers.question_id = questions.id
      SQL

      end_time = Time.now
      puts "Extract all annotations with file content = #{end_time - start_time} seconds"

      start_time = Time.now

      annotations_grouped = annotations_with_file_content.group_by do |row|
        [row['content'], row['actable_id'], row['file_id']]
      end

      end_time = Time.now
      puts "Grouping annotations based on file_id = #{end_time - start_time} seconds"

      start_time = Time.now

      annotations_grouped.map do |key, values|
        content, actable_id, file_id = key
        programming_question = Course::Assessment::Question::Programming.find(actable_id)
        language = programming_question.language

        lines = values.map { |value| value['line'] }
        highlighted_code = helper.highlight_code_block(content, language)

        if !annotations_present_on_line_one_and_two(lines) && lines_are_added(highlighted_code)
          safe_decrement_annotation_line_number(file_id)
        end
      end

      end_time = Time.now
      puts "Update annotation lines = #{end_time - start_time} seconds"
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

# we do not want to decrease the line number if line 1 and line 2 was having the annotation in that file
def annotations_present_on_line_one_and_two(lines)
  lines.include?(1) && lines.include?(2)
end

# if the line number is 1, we do not wish to decrement that as doing so will render annotation to be out-of-bound
# therefore, we only update the annotation if the line_number is bigger than 1
def safe_decrement_annotation_line_number(file_id)
  annotations = Course::Assessment::Answer::ProgrammingFileAnnotation.where(file_id: file_id)

  annotations.find_each do |annotation|
    line_number = annotation.line

    annotation.update(line: line_number - 1) unless line_number == 1
  end
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
