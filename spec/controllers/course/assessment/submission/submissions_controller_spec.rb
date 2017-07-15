# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::SubmissionsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, :published, :with_all_question_types, course: course) }
    let(:immutable_submission) do
      create(:submission, assessment: assessment, creator: user).tap do |stub|
        allow(stub).to receive(:save).and_return(false)
        allow(stub).to receive(:update_attributes).and_return(false)
        allow(stub).to receive(:destroy).and_return(false)
      end
    end
    let(:submission) { create(:submission, assessment: assessment, creator: user) }

    before { sign_in(user) }

    describe '#index' do
      subject do
        get :index, course_id: course, assessment_id: assessment
      end

      context 'when a student visits the page' do
        let(:course) { create(:course) }
        let(:user) { create(:course_student, course: course).user }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

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
          expect(flash[:danger]).to eq(I18n.t('course.assessment.submission.submissions.create.'\
                                              'failure', error: ''))
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

        it { is_expected.to have_http_status(400) }
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

    describe '#reload_answer' do
      let(:submission) { create(:submission, assessment: assessment, creator: user) }

      context 'when answer_id does not exist' do
        subject do
          post :reload_answer, course_id: course, assessment_id: assessment.id,
                               id: submission.id, answer_id: -1, format: :json
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    context 'when the assessment is autograded' do
      let(:assessment) { create(:assessment, :autograded, :with_mrq_question, course: course) }
      let!(:answer) do
        answer = assessment.questions.first.attempt(submission)
        answer.save
        answer
      end

      describe '#submit_answer' do
        subject do
          put :submit_answer,
              course_id: course, assessment_id: assessment, id: submission, answer_id: answer.id,
              answer: { id: answer.id }, format: :json
        end

        context 'when update fails' do
          before do
            allow(answer).to receive(:save).and_return(false)
            allow(submission.answers).to receive(:find).and_return(answer)
            controller.instance_variable_set(:@submission, submission)
            subject
          end

          it { is_expected.to have_http_status(400) }
        end
      end
    end
  end
end
