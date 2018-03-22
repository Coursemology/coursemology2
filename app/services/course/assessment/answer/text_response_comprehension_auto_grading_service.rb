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

    answer_grade = grade_for(question, answer_text_lemma_status)
    correct = correctness_for(question, answer_grade)

    [
      correct,
      answer_grade,
      explanations_for(question, answer_grade, answer_text_array, answer_text_lemma_status, correct)
    ]
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
            if hash.key? solution_key
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

        unless lifted_word_status.include?(first_solution_point)
          # keyword (Solution) does NOT belong to a "lifted" Point
          keyword_status[index] = first_solution
          break
        end
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
  # @return [Integer] The grade of the student answer for the question.
  def grade_for(question, answer_text_lemma_status)
    lifted_word_points = answer_text_lemma_status[:compre_lifted_word]
    keyword_solutions = answer_text_lemma_status[:compre_keyword]

    question_grade = question.groups.reduce(0) do |question_sum, group|
      group_grade = group.points.
                    reject { |point| lifted_word_points.include?(point) }.
                    select { |point| point.solutions.select(&:compre_keyword?).all? { |s| keyword_solutions.include?(s) } }.
                    reduce(0) { |group_sum, point| group_sum + point.point_grade }
      question_sum + [group_grade, group.maximum_group_grade].min
    end

    [question_grade, question.maximum_grade].min
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
  # @param [Boolean] correct True if the answer is correct.
  # @return [Array<String>] The explanations for the given question.
  def explanations_for(question, grade, answer_text_array, answer_text_lemma_status, correct)
    [
      explanations_for_keyword(answer_text_array, answer_text_lemma_status[:compre_keyword]),
      explanations_for_lifted_word(answer_text_array, answer_text_lemma_status[:compre_lifted_word]),
      explanations_for_grade(question, grade, correct)
    ].flatten
  end

  # @param [Array<String>] answer_text_array The normalized, downcased, letters-only answer text
  #   in array form.
  # @param [Array<nil or TextResponseComprehensionPoint or TextResponseComprehensionSolution>] status
  #   A particular hash value in +answer_text_lemma_status+.
  # @return [Array<String>] The explanations for keywords.
  def explanations_for_keyword(answer_text_array, status)
    if status.any?
      explanations = []
      status.each_index do |index|
        explanations.push(answer_text_array[index]) unless status[index].nil?
      end
      ['The following words were <u>correctly expressed</u>:', explanations.join(', '), '<br>']
    else
      []
    end
  end

  # @param [Array<String>] answer_text_array The normalized, downcased, letters-only answer text
  #   in array form.
  # @param [Array<nil or TextResponseComprehensionPoint or TextResponseComprehensionSolution>] status
  #   A particular hash value in +answer_text_lemma_status+.
  # @return [Array<String>] The explanations for lifted words.
  def explanations_for_lifted_word(answer_text_array, status)
    if status.any?
      explanations = []
      status.each_index do |index|
        explanations.push(answer_text_array[index]) unless status[index].nil?
      end
      ['The following words were <u>lifted from the text passage</u>:', explanations.join(', '), '<br>']
    else
      []
    end
  end

  # @param [Course::Assessment::Question::TextResponse] question The question answered by the
  #   student.
  # @param [Integer] grade The grade of the student answer for the question.
  # @param [Boolean] correct True if the answer is correct.
  # @return [Array<String>] The explanations for grade.
  def explanations_for_grade(question, grade, correct)
    explanations = ["Grade: #{grade} / #{question.maximum_grade}"]
    explanations.push('<br>', 'One or more keywords are missing from your answer.') unless correct
    explanations
  end
end
