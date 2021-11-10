# frozen_string_literal: true
require 'rwordnet'
class Course::Assessment::Answer::TextResponseComprehensionAutoGradingService < \
  Course::Assessment::Answer::AutoGradingService
  def evaluate(answer)
    answer.correct, grade, messages = evaluate_answer(answer.actable)
    answer.auto_grading.result = { messages: messages }
    grade
  end

  private

  # Grades the given answer.
  #
  # @param [Course::Assessment::Answer::TextResponse] answer The answer specified by the
  #   student.
  # @return [Array<(Boolean, Integer, Object)>] The correct status, grade and the messages to be
  #   assigned to the grading.
  def evaluate_answer(answer)
    question = answer.question.actable
    answer_text_array = answer.normalized_answer_text.downcase.gsub(/([^a-z ])/, ' ').split(' ')
    answer_text_lemma_array = []
    answer_text_array.each { |a| answer_text_lemma_array.push(WordNet::Synset.morphy_all(a).first || a) }

    hash_lifted_word_points = hash_compre_lifted_word(question)
    hash_keyword_solutions = hash_compre_keyword(question)

    lifted_word_status = find_compre_lifted_word_in_answer(answer_text_lemma_array, hash_lifted_word_points)
    keyword_status = find_compre_keyword_in_answer(answer_text_lemma_array, lifted_word_status, hash_keyword_solutions)

    answer_text_lemma_status = {
      'compre_lifted_word': lifted_word_status,
      'compre_keyword': keyword_status
    }

    answer_grade, correct_points = grade_for(question, answer_text_lemma_status)
    correct = correctness_for(question, answer_grade)
    explanations = explanations_for(
      question, answer_grade, answer_text_array, answer_text_lemma_status, correct_points
    )

    [correct, answer_grade, explanations]
  end

  # All lifted words in a question as keys and
  # an array of Points where words are found as values.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @return [Hash{String=>Array<Course::Assessment::Question::TextResponseComprehensionPoint>}]
  #   The mapping from lifted words to Points.
  def hash_compre_lifted_word(question)
    hash = {}
    question.groups.each do |group|
      group.points.each do |point|
        # for all TextResponseComprehensionSolution where solution_type == compre_lifted_word
        point.solutions.select(&:compre_lifted_word?).each do |s|
          s.solution_lemma.each do |solution_key|
            if hash.key?(solution_key)
              hash_value = hash[solution_key]
              hash_value.push(point) unless hash_value.include?(point)
            else
              hash[solution_key] = [point]
            end
          end
        end
      end
    end
    hash
  end

  # All keywords in a question as keys and
  # an array of Solutions where words are found as values.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @return [Hash{String=>Array<Course::Assessment::Question::TextResponseComprehensionSolution>}]
  #   The mapping from keywords to Solutions.
  def hash_compre_keyword(question)
    hash = {}
    question.groups.each do |group|
      group.points.each do |point|
        # for all TextResponseComprehensionSolution where solution_type == compre_keyword
        point.solutions.select(&:compre_keyword?).each do |s|
          s.solution_lemma.each do |solution_key|
            if hash.key?(solution_key)
              hash_value = hash[solution_key]
              hash_value.push(s) unless hash_value.include?(s)
            else
              hash[solution_key] = [s]
            end
          end
        end
      end
    end
    hash
  end

  # Find for all compre_lifted_word in answer.
  # If word is found, set +answer_text_lemma_status["compre_lifted_word"][index]+ to the
  # corresponding Point.
  #
  # @param [Array<String>] answer_text_lemma_array The lemmatised answer text in array form.
  # @param [Hash{String=>Array<Course::Assessment::Question::TextResponseComprehensionPoint>}] hash
  #   The mapping from lifted words to Points.
  # @return [Array<nil or TextResponseComprehensionPoint>}] lifted_word
  #   The lifted word status of each element in +answer_text_lemma+.
  def find_compre_lifted_word_in_answer(answer_text_lemma_array, hash)
    lifted_word_status = Array.new(answer_text_lemma_array.length, nil)

    answer_text_lemma_array.each_with_index do |answer_text_lemma_word, index|
      next unless hash.key?(answer_text_lemma_word) && !hash[answer_text_lemma_word].empty?

      # lifted word found in answer
      first_point = hash[answer_text_lemma_word].shift
      lifted_word_status[index] = first_point

      # for same Point, remove from all other values in hash
      hash.each_value do |point_array|
        point_array.delete_if { |point| point.equal? first_point }
      end
    end

    lifted_word_status
  end

  # Find for all compre_keyword in answer.
  # If word is found, set +answer_text_lemma_status["compre_keyword"][index]+ to the
  # corresponding Solution.
  # and collate an array of all Solutions where keywords are found in answer.
  #
  # @param [Array<String>] answer_text_lemma_array The lemmatised answer text in array form.
  # @param [Array<nil or TextResponseComprehensionPoint>] lifted_word_status
  #   The lifted word status of each element in +answer_text_lemma+.
  # @param [Hash{String=>Array<Course::Assessment::Question::TextResponseComprehensionSolution>}] hash
  #   The mapping from keywords to Solutions.
  # @return [Array<nil or TextResponseComprehensionSolution>}] keyword_status
  #   The keyword status of each element in +answer_text_lemma+.
  def find_compre_keyword_in_answer(answer_text_lemma_array, lifted_word_status, hash)
    keyword_status = Array.new(answer_text_lemma_array.length, nil)

    answer_text_lemma_array.each_with_index do |answer_text_lemma_word, index|
      next unless lifted_word_status[index].nil? ||
                  (hash.key?(answer_text_lemma_word) && !hash[answer_text_lemma_word].empty?)

      # keyword found in answer
      until !hash.key?(answer_text_lemma_word) || hash[answer_text_lemma_word].empty?
        first_solution = hash[answer_text_lemma_word].shift
        first_solution_point = first_solution.point

        # for same Solution, remove from all other values in hash
        hash.each_value do |solution_array|
          solution_array.delete_if { |solution| solution.equal? first_solution }
        end

        next if lifted_word_status.include?(first_solution_point)

        # keyword (Solution) does NOT belong to a "lifted" Point
        keyword_status[index] = first_solution
        break
      end

      keyword_status
    end

    keyword_status
  end

  # Returns the grade for a question with all matched solutions.
  #
  # The grade is considered to be the sum of grades assigned to all matched solutions, but not
  # exceeding the maximum grade of the point, group and question.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @param [Hash{String=>Array<nil or TextResponseComprehensionPoint or TextResponseComprehensionSolution>}]
  #   answer_text_lemma_status The status of each element in +answer_text_lemma+.
  # @return [Array<(Integer, [Array<TextResponseComprehensionPoint])>] The grade of the
  #   student answer for the question and array of correct Points.
  def grade_for(question, answer_text_lemma_status)
    lifted_word_points = answer_text_lemma_status[:compre_lifted_word]
    keyword_solutions = answer_text_lemma_status[:compre_keyword]
    correct_points = []

    question_grade = question.groups.reduce(0) do |question_sum, group|
      group_points = group.points.
                     reject { |point| lifted_word_points.include?(point) }.
                     select do |point|
                       point.solutions.select(&:compre_keyword?).all? do |s|
                         keyword_solutions.include?(s)
                       end
                     end
      group_grade = group_points.reduce(0) do |group_sum, point|
        correct_points.push(point)
        group_sum + point.point_grade
      end
      question_sum + [group_grade, group.maximum_group_grade].min
    end

    [
      [question_grade, question.maximum_grade].min,
      correct_points
    ]
  end

  # Mark the correctness of the answer based on grade.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @param [Integer] grade The grade of the student answer for the question.
  # @return [Boolean] correct True if the answer is correct.
  def correctness_for(question, grade)
    grade >= question.maximum_grade
  end

  # Returns the explanations for the given status.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @param [Integer] grade The grade of the student answer for the question.
  # @param [Array<String>] answer_text_array The normalized, downcased, letters-only answer text
  #   in array form.
  # @param [Hash{String=>Array<nil or TextResponseComprehensionPoint or TextResponseComprehensionSolution>}]
  #   answer_text_lemma_status The status of each element in +answer_text_lemma+.
  # @param [Array<TextResponseComprehensionPoint]] correct_points The array of correct Points.
  # @return [Array<String>] The explanations for the given question.
  def explanations_for(question, grade, answer_text_array, answer_text_lemma_status, correct_points)
    hash_point_serial = hash_point_id(question)
    [
      explanations_for_points_summary_incorrect(
        question, answer_text_array, answer_text_lemma_status, correct_points, hash_point_serial
      ),
      explanations_for_correct_paraphrase(
        answer_text_array, answer_text_lemma_status[:compre_keyword], hash_point_serial
      ),
      explanations_for_grade(
        question, grade
      )
    ].flatten
  end

  # All Point ID as keys and serially 'numbered' letter (starting from 'a') as values.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @return [Hash{Integer=>String}] The mapping from Point ID to serial 'number' (letter) for that Point.
  def hash_point_id(question)
    hash = {}
    question.groups.flat_map(&:points).each_with_index do |point, index|
      hash[point.id] = convert_number_to_letter(index + 1)
    end
    hash
  end

  # Converts a positive index number to letter format (e.g. 1 => 'a', 27 => 'aa').
  # https://www.geeksforgeeks.org/find-excel-column-name-given-number/
  #
  # @param [Integer] number The positive index number.
  # @return [String] The index in letter format.
  def convert_number_to_letter(number)
    hash_number_to_letter = Hash[(0..25).zip('a'..'z')]
    output = ''
    while number > 0
      remainder = number % 26
      number /= 26
      if remainder == 0
        output += 'z'
        number -= 1
      else
        output += hash_number_to_letter[remainder - 1]
      end
    end
    output.reverse!
  end

  # Returns the explanations (summary + incorrect) for all Points, split by each Point.
  #
  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @param [Array<String>] answer_text_array The normalized, downcased, letters-only answer text
  #   in array form.
  # @param [Hash{String=>Array<nil or TextResponseComprehensionPoint or TextResponseComprehensionSolution>}]
  #   answer_text_lemma_status The status of each element in +answer_text_lemma+.
  # @param [Array<TextResponseComprehensionPoint]] correct_points The array of correct Points.
  # @param [Hash{Integer=>String}] hash_point_serial The mapping from Point ID to serial 'number' (letter)
  #   for that Point.
  # @return [Array<String>] The explanations for the Points.
  def explanations_for_points_summary_incorrect(question, answer_text_array,
                                                answer_text_lemma_status, correct_points, hash_point_serial)
    explanations = []

    question.groups.flat_map(&:points).each do |point|
      explanations.push(
        I18n.t(
          'course.assessment.answer.text_response_comprehension_auto_grading.explanations.point_html',
          index: hash_point_serial[point.id]
        )
      )

      if correct_points.include?(point)
        explanations.push(
          I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.correct_point')
        )
      else
        explanations.push(
          explanations_for_incorrect_point(answer_text_array, answer_text_lemma_status, point)
        )
      end
      explanations.push(
        I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.line_break_html')
      )
    end

    return if explanations.empty?

    explanations.push(
      I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.horizontal_break_html'),
      I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.line_break_html')
    )
  end

  # Returns the explanations for an incorrect Point.
  #
  # @param [Array<String>] answer_text_array The normalized, downcased, letters-only answer text
  #   in array form.
  # @param [Hash{String=>Array<nil or TextResponseComprehensionPoint or TextResponseComprehensionSolution>}]
  #   answer_text_lemma_status The status of each element in +answer_text_lemma+.
  # @param [TextResponseComprehensionPoint] point The incorrect Point to generate explanation for.
  # @return [Array<String>] The explanations for the incorrect Point.
  def explanations_for_incorrect_point(answer_text_array, answer_text_lemma_status, point)
    explanations = []
    if answer_text_lemma_status[:compre_lifted_word].include?(point)
      explanations.push(
        explanations_for_incorrect_point_lifted_words(answer_text_array, answer_text_lemma_status, point)
      )
    end
    explanations.push(
      explanations_for_incorrect_point_missing_keywords(answer_text_lemma_status, point)
    )
  end

  # Returns the lifted words explanations for an incorrect Point.
  #
  # @param [Array<String>] answer_text_array The normalized, downcased, letters-only answer text
  #   in array form.
  # @param [Hash{String=>Array<nil or TextResponseComprehensionPoint or TextResponseComprehensionSolution>}]
  #   answer_text_lemma_status The status of each element in +answer_text_lemma+.
  # @param [TextResponseComprehensionPoint] point The incorrect Point to generate explanation for.
  # @return [String] The lifted words explanations for the incorrect Point.
  def explanations_for_incorrect_point_lifted_words(answer_text_array, answer_text_lemma_status, point)
    lifted_words = []
    answer_text_lemma_status[:compre_lifted_word].each_with_index do |status_point, status_index|
      lifted_words.push(answer_text_array[status_index]) if status_point == point
    end
    if lifted_words.count == 1
      I18n.t(
        'course.assessment.answer.text_response_comprehension_auto_grading.explanations.lifted_word_singular',
        word_string: lifted_words.first
      )
    else
      lifted_words_string =
        lifted_words[0..-2].join(
          I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.concatenate')
        ) +
        I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.concatenate_last') +
        lifted_words.last
      I18n.t(
        'course.assessment.answer.text_response_comprehension_auto_grading.explanations.lifted_word_plural',
        words_string: lifted_words_string
      )
    end
  end

  # Returns the missing keywords explanations for an incorrect Point.
  #
  # @param [Hash{String=>Array<nil or TextResponseComprehensionPoint or TextResponseComprehensionSolution>}]
  #   answer_text_lemma_status The status of each element in +answer_text_lemma+.
  # @param [TextResponseComprehensionPoint] point The incorrect Point to generate explanation for.
  # @return [String] The missing keywords explanations for the incorrect Point.
  def explanations_for_incorrect_point_missing_keywords(answer_text_lemma_status, point)
    empty_information = I18n.t('course.assessment.answer.
      text_response_comprehension_auto_grading.explanations.empty_information')
    missing_keywords = point.
                       solutions.
                       select(&:compre_keyword?).
                       reject { |s| answer_text_lemma_status[:compre_keyword].include?(s) }.
                       flat_map { |s| s.information.empty? ? empty_information : s.information }
    if missing_keywords.empty?
      []
    elsif missing_keywords.count == 1
      I18n.t(
        'course.assessment.answer.text_response_comprehension_auto_grading.explanations.missing_keyword_singular',
        word_string: missing_keywords.first
      )
    else
      missing_keywords_string =
        missing_keywords[0..-2].join(
          I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.concatenate')
        ) +
        I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.concatenate_last') +
        missing_keywords.last
      I18n.t(
        'course.assessment.answer.text_response_comprehension_auto_grading.explanations.missing_keyword_plural',
        words_string: missing_keywords_string
      )
    end
  end

  # Returns the explanations for all correctly paraphrased keywords.
  #
  # @param [Array<String>] answer_text_array The normalized, downcased, letters-only answer text
  #   in array form.
  # @param [Array<nil or TextResponseComprehensionSolution>}] keyword_status
  #   The keyword status of each element in +answer_text_lemma+.
  # @param [Hash{Integer=>Integer}] hash_point_serial The mapping from Point ID to serial 'number' (letter)
  #   for that Point.
  # @return [Array<String>] The explanations for the correct keywords.
  def explanations_for_correct_paraphrase(answer_text_array, keyword_status, hash_point_serial)
    hash_keywords = {} # point_id => [word in answer_text, information]
    keyword_status.each_with_index do |s, index|
      unless s.nil?
        hash_keywords[s.point.id] = [] unless hash_keywords.key?(s.point.id)
        hash_keywords[s.point.id].push([answer_text_array[index], s.information])
      end
    end
    explanations = explanations_for_correct_paraphrase_by_points(hash_keywords, hash_point_serial)

    return if explanations.empty?

    explanations.push(
      I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.horizontal_break_html'),
      I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.line_break_html')
    )
  end

  # Returns the explanations for correctly paraphrased keywords, split by each Point.
  #
  # @param [Array<String>] answer_text_array The normalized, downcased, letters-only answer text
  #   in array form.
  # @param [Hash{Integer=>Array< Array<String, String> >}] hash_keywords The mapping from Point ID to serial
  #    'number' (letter) for that Point, to an array of nested arrays of [word in answer_text, information].
  # @param [Hash{Integer=>Integer}] hash_point_serial The mapping from Point ID to serial 'number' (letter)
  #   for that Point.
  # @return [Array<String>] The explanations for the correct keywords.
  def explanations_for_correct_paraphrase_by_points(hash_keywords, hash_point_serial)
    explanations = []
    empty_information = I18n.t('course.assessment.answer.
      text_response_comprehension_auto_grading.explanations.empty_information')
    hash_keywords.keys.sort.each do |key| # point_id
      value = hash_keywords[key]
      point_serial_number = hash_point_serial[key]
      explanations.push(
        I18n.t(
          'course.assessment.answer.text_response_comprehension_auto_grading.explanations.point_html',
          index: point_serial_number
        )
      )
      explanations.push(
        value.map do |v|
          I18n.t(
            'course.assessment.answer.text_response_comprehension_auto_grading.explanations.correct_keyword',
            answer: v[0],
            keyword: v[1].empty? ? empty_information : v[1]
          )
        end,
        I18n.t('course.assessment.answer.text_response_comprehension_auto_grading.explanations.line_break_html')
      )
    end
    explanations
  end

  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @param [Integer] grade The grade of the student answer for the question.
  # @return [Array<String>] The explanations for grade.
  def explanations_for_grade(question, grade)
    I18n.t(
      'course.assessment.answer.text_response_comprehension_auto_grading.explanations.grade',
      grade: grade,
      maximum_grade: question.maximum_grade
    )
  end
end
