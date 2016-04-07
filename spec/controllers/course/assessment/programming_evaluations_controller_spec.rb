# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingEvaluationsController do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:user, :auto_grader) }
    let(:course) { create(:course, creator: user) }
    let(:evaluation) do
      create(:course_assessment_programming_evaluation, *evaluation_traits, course: course)
    end
    let(:evaluation_traits) { nil }
    let(:immutable_evaluation) do
      create(:course_assessment_programming_evaluation, course: course).tap do |stub|
        allow(stub).to receive(:save).and_return(false)
        allow(stub).to receive(:update_attributes).and_return(false)
        allow(stub).to receive(:destroy).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#allocate' do
      let(:request) do
        post :allocate, format: :json, course_id: course
      end

      context 'when saving fails' do
        before do
          controller.instance_variable_set(:@programming_evaluations, [immutable_evaluation])
          request
        end

        it { is_expected.to respond_with(400) }
      end
    end

    describe '#update_result' do
      let(:evaluation_traits) { [:assigned] }
      let(:request) do
        put :update_result, format: :json, course_id: course, programming_evaluation_id: evaluation,
                            programming_evaluation: evaluation.attributes.slice('stdout', 'stderr',
                                                                                'test_report')
      end

      context 'when saving fails' do
        before do
          immutable_evaluation.assign!(User.system)
          controller.instance_variable_set(:@programming_evaluation, immutable_evaluation)
          request
        end

        it { is_expected.to respond_with(400) }
      end
    end

    describe '#load_and_authorize_pending_programming_evaluation' do
      subject { controller.send(:load_and_authorize_pending_programming_evaluation) {} }

      context 'when the allocated programming evaluation was assigned to another thread' do
        before do
          count = 0
          wrapper = proc do |method, *args|
            count += 1
            raise IllegalStateError if count == 1
            method.call(*args)
          end

          expect(controller).to receive(:find_pending_programming_evaluation).exactly(:twice).
            and_wrap_original(&wrapper)
        end

        it 'retries the allocation' do
          subject
          expect(controller.instance_variable_get(:@programming_evaluations)).to be_a(Array)
        end
      end
    end

    describe '#find_pending_programming_evaluation' do
      subject { controller.send(:find_pending_programming_evaluation) }

      before do
        allow(Course::Assessment::ProgrammingEvaluation).to \
          receive_message_chain(:accessible_by, :with_language, :pending, :take).
          and_return(evaluation)
      end

      context 'when no evaluations are pending' do
        let(:evaluation) { nil }
        it 'returns nil' do
          expect(subject).to be_nil
        end
      end

      context 'when an evaluation is pending' do
        it 'returns the evaluation' do
          evaluation
          expect(subject).to eq(evaluation)
        end
      end

      context 'when the evaluation is changed by another thread' do
        it 'raises an IllegalStateError' do
          expect(evaluation).to receive(:lock!).and_wrap_original do |method, *args|
            evaluation.assign!(user)
            evaluation.save
            method.call(*args)
          end

          expect { subject }.to raise_error(IllegalStateError)
        end
      end
    end
  end
end
