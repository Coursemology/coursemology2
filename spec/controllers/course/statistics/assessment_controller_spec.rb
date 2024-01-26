# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Statistics::AssessmentsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :enrollable) }
    let(:assessment) { create(:assessment, :published, :with_all_question_types, course: course) }
    let(:students) { create_list(:course_student, 3, course: course) }
    let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }

    let!(:submission1) do
      create(:submission, :published,
             assessment: assessment, course: course, creator: students[0].user)
    end
    let!(:submission2) do
      create(:submission, :attempting,
             assessment: assessment, course: course, creator: students[1].user)
    end
    let!(:submission_teaching_assistant) do
      create(:submission, :published,
             assessment: assessment, course: course, creator: teaching_assistant.user)
    end

    describe '#assessment' do
      render_views
      subject { get :assessment, as: :json, params: { course_id: course, id: assessment.id } }

      context 'when the Normal User get the submission data for chart display' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Student get the submission data for chart display' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Manager get the submission data for chart display' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }

        it 'returns OK with right number of submissions being displayed' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          # only the students starting the assessment will have their data recorded here
          expect(json_result['submissions'].count).to eq(2)

          # only published submissions' answers will be included in the stats
          expect(json_result['submissions'][0]['courseUser']['role']).to eq('student')
          expect(json_result['submissions'][1]['courseUser']['role']).to eq('student')

          # showing the correct workflow state
          expect(json_result['submissions'][0]['workflowState']).to eq('published')
          expect(json_result['submissions'][1]['workflowState']).to eq('attempting')

          # however, all the students information will be sent to frontend
          expect(json_result['allStudents'].count).to eq(3)
        end
      end
    end

    describe '#ancestors' do
      let(:destination_course) { create(:course) }
      let!(:duplicate_objects) do
        Course::Duplication::ObjectDuplicationService.
          duplicate_objects(course, destination_course, [assessment], {})
      end

      context 'after the assessment is being duplicated' do
        render_views
        subject do
          get :ancestors, as: :json, params: { course_id: destination_course,
                                               id: destination_course.assessments[0].id }
        end

        context 'when the administrator wants to get ancestors' do
          let(:administrator) { create(:administrator) }
          before { sign_in(administrator) }

          it 'gives both the assessment information' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['assessments'].count).to eq(2)
          end
        end

        context 'when the course manager of the destination course wants to get ancestors' do
          let(:course_manager) { create(:course_manager, course: destination_course) }
          before { sign_in(course_manager.user) }

          it 'gives only the information regarding current destination as no authorization for parent course' do
            expect(subject).to have_http_status(:success)
            json_result = JSON.parse(response.body)

            expect(json_result['assessments'].count).to eq(1)
          end
        end
      end
    end

    describe '#marks_per_question' do
      render_views
      subject { get :marks_per_question, as: :json, params: { course_id: course, id: assessment.id } }

      context 'when the Normal User fetch marks per question statistics' do
        let(:user) { create(:user) }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Student fetch marks per question statistics' do
        let(:user) { create(:course_student, course: course).user }
        before { sign_in(user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Manager fetch marks per question statistics' do
        let(:user) { create(:course_manager, course: course).user }
        before { sign_in(user) }

        it 'returns OK with right number of submissions being displayed' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          # all the students data will be included here, including the non-published one
          expect(json_result['submissions'].count).to eq(3)

          # only published submissions' answers will be included in the stats
          expect(json_result['submissions'][0]['answers']).not_to be_nil
          expect(json_result['submissions'][1]['answers']).to be_nil
          expect(json_result['submissions'][2]['answers']).to be_nil

          # showing the correct workflow state
          expect(json_result['submissions'][0]['workflowState']).to eq('published')
          expect(json_result['submissions'][1]['workflowState']).to eq('attempting')
          expect(json_result['submissions'][2]['workflowState']).to be_nil
        end
      end
    end
  end
end
