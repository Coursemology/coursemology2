# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ProgrammingEvaluationsController do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:user, :auto_grader) }
    let(:course) { create(:course, creator: user) }
    let(:evaluation) do
      create(:course_assessment_programming_evaluation, :assigned, course: course)
    end
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
  end
end
