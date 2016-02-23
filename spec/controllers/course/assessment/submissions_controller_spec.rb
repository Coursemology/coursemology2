# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::SubmissionsController do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :with_all_question_types, course: course) }
    let!(:immutable_submission) do
      create(:submission, assessment: assessment, user: user).tap do |stub|
        allow(stub).to receive(:save).and_return(false)
        allow(stub).to receive(:update_attributes).and_return(false)
        allow(stub).to receive(:destroy).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#create' do
      subject do
        post :create, course_id: course, assessment_id: assessment
      end

      context 'when create fails' do
        before do
          controller.instance_variable_set(:@submission, immutable_submission)
          subject
        end

        it { is_expected.to redirect_to(course_assessments_path(course)) }
        it 'sets the proper flash message' do
          expect(flash[:danger]).to eq(I18n.t('course.assessment.submissions.create.failure',
                                              error: ''))
        end
      end
    end

    describe '#update' do
      subject do
        post :update, course_id: course, assessment_id: assessment, id: immutable_submission,
                      submission: { title: '' }
      end

      context 'when update fails' do
        before do
          controller.instance_variable_set(:@submission, immutable_submission)
          subject
        end

        it { is_expected.to render_template('edit') }
      end
    end

    describe '#extract_instance_variables' do
      subject do
        get :edit, course_id: course, assessment_id: assessment, id: immutable_submission
      end

      it 'extracts instance variables from services' do
        subject

        expect(controller.instance_variable_get(:@questions_to_attempt)).to be_present
      end
    end

    context 'when the assessment is guided' do
      let(:assessment) { create(:assessment, :guided, :with_mcq_question, course: course) }
      let!(:answer) do
        answer = assessment.questions.first.attempt(immutable_submission)
        answer.save
        answer
      end

      describe '#submit_answer' do
        subject do
          put :update, course_id: course, assessment_id: assessment, id: immutable_submission,
                       attempting_answer_id: answer.id, submission: { title: '' }
        end

        context 'when update fails' do
          before do
            controller.instance_variable_set(:@submission, immutable_submission)
            subject
          end

          it { is_expected.to render_template('edit') }
        end
      end
    end
  end
end
