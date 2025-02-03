# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RagWise::ResponseEvaluationService, type: :service do
  let(:default_trust_setting) { 50 }
  let(:ragas_double) { instance_double('Langchain::Evals::Ragas::Main') }

  before do
    allow(Langchain::Evals::Ragas::Main).to receive(:new).and_return(ragas_double)
  end

  describe '#initialize' do
    let(:service) { described_class.new(default_trust_setting) }
    it 'initializes with correct attributes' do
      expect(service.context).to eq('')
      expect(service.question).to eq('')
      expect(service.answer).to eq('')
      expect(service.scores).to be_nil
    end
  end

  describe '#evaluate' do
    before do
      service.context = 'Sample context'
      service.question = 'Sample question'
      service.answer = 'Sample answer'
    end

    context 'when trust is 0' do
      let(:service) { described_class.new('0') }

      it 'returns false' do
        expect(service.evaluate).to be false
      end
    end

    context 'when trust is 100' do
      let(:service) { described_class.new('100') }

      it 'returns true' do
        expect(service.evaluate).to be true
      end
    end

    context 'when trust is between 0 and 100' do
      let(:service) { described_class.new(50) }
      let(:mock_scores) { { answer_relevance_score: 0.6, faithfulness_score: 0.7 } }

      before do
        allow(ragas_double).to receive(:score).with(answer: service.answer, question: service.question,
                                                    context: service.context).and_return(mock_scores)
      end

      it 'returns true if scores meet the minimum acceptable threshold' do
        expect(service.evaluate).to be true
      end

      it 'returns false if scores are below the minimum acceptable threshold' do
        low_scores = { answer_relevance_score: 0.3, faithfulness_score: 0.4 }
        allow(ragas_double).to receive(:score).and_return(low_scores)

        expect(service.evaluate).to be false
      end
    end
  end
end
