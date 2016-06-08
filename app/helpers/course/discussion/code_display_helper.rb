# frozen_string_literal: true
module Course::Discussion::CodeDisplayHelper
  # Display code lines in file.
  #
  # @param [Course::Assessment::Answer::ProgrammingFile] file The code file.
  # @param [Integer] line_start The one based start line number.
  # @param [Integer] line_end The one based end line line number.
  # @return [String] A HTML fragment containing the code lines.
  def display_code_lines(file, line_start, line_end)
    code = file.lines((line_start - 1)..(line_end - 1)).join("\n")
    format_code_block(code, file.answer.question.actable.language, [line_start, 1].max)
  end
end
