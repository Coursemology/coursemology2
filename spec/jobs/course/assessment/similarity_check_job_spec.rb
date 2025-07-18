# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::SimilarityCheckJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Course::Assessment::SimilarityCheckJob }

    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }

    context 'when running similarity check' do
      let(:service) { instance_double(Course::Assessment::Submission::SsidSimilarityService) }

      before do
        allow(Course::Assessment::Submission::SsidSimilarityService).
          to receive(:new).with(course, assessment).and_return(service)
      end

      context 'when similarity check succeeds' do
        before do
          assessment.create_similarity_check(workflow_state: :running)
          allow(service).to receive(:run_similarity_check)
        end

        it 'updates state to completed' do
          subject.perform_now(course, assessment)
          expect(assessment.similarity_check.reload.workflow_state).to eq('completed')
        end
      end

      context 'when similarity check fails' do
        before do
          allow(service).to receive(:run_similarity_check).and_raise(SsidError.new('error'))
          assessment.create_similarity_check(workflow_state: :running)
        end

        it 'updates state to failed' do
          subject.perform_now(course, assessment)
          expect(assessment.similarity_check.reload.workflow_state).to eq('failed')
        end
      end
    end
  end
end
