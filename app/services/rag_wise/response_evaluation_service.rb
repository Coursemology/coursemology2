# frozen_string_literal: true
class RagWise::ResponseEvaluationService
  attr_accessor :context, :question, :answer, :scores

  def initialize(trust_setting)
    @trust = trust_setting
    @ragas = Langchain::Evals::Ragas::Main.new(llm: RAGAS)
    @context = ''
    @question = ''
    @answer = ''
    @scores = nil
  end

  def evaluate
    return false if draft?
    return true if publish?

    @scores = @ragas.score(answer: @answer, question: @question, context: @context)

    evaluate_scores(@scores)
  end

  private

  def draft?
    Integer(@trust) == 0
  end

  def publish?
    Integer(@trust) == 100
  end

  def evaluate_scores(scores)
    answer_relevance = scores[:answer_relevance_score]
    faithfulness = scores[:faithfulness_score]

    min_acceptable_score = (100.0 - Integer(@trust)) / 100

    answer_relevance >= min_acceptable_score &&
      faithfulness >= min_acceptable_score
  end
end
