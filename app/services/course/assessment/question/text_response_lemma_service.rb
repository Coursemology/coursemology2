# frozen_string_literal: true
require 'rwordnet'
class Course::Assessment::Question::TextResponseLemmaService
  # @param [Array<String>] word_array Words to lemmatise
  # @return [Array<String>] Words in lemma form
  def lemmatise(word_array)
    word_array.flat_map { |word| WordNet::Synset.morphy_all(word) || word }.uniq
  end
end
