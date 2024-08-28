# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Statistics::AssessmentsController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:original_course) { create(:course) }
    let(:course) { create(:course) }
    let(:original_assessment) { create(:assessment, :published, :with_all_question_types, course: original_course) }

    let!(:duplicate_objects) do
      Course::Duplication::ObjectDuplicationService.
        duplicate_objects(original_course, course, [original_assessment], {})
    end

    let(:assessment) { course.assessments.first }

    let(:students) { create_list(:course_student, 4, course: course) }
    let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }

    let!(:submission1) do
      create(:submission, :published,
             assessment: assessment, course: course, creator: students[0].user)
    end
    let!(:submission2) do
      create(:submission, :attempting,
             assessment: assessment, course: course, creator: students[1].user)
    end
    let!(:submission3) do
      create(:submission, :graded,
             assessment: assessment, course: course, creator: students[2].user)
    end
    let!(:submission_teaching_assistant) do
      create(:submission, :published,
             assessment: assessment, course: course, creator: teaching_assistant.user)
    end

    describe '#main_statistics' do
      render_views
      subject { get :main_statistics, as: :json, params: { course_id: course, id: assessment.id } }

      context 'when the Normal User get the main statistics data' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Student get the main statistics data' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Manager get the main statistics data' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }

        it 'returns OK with right number of submissions and ancestor being displayed' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          # all the students data will be included here, including the non-existing submission one
          expect(json_result['submissions'].count).to eq(4)

          # showing the correct workflow state
          expect(json_result['submissions'][0]['workflowState']).to eq('published')
          expect(json_result['submissions'][1]['workflowState']).to eq('attempting')
          expect(json_result['submissions'][2]['workflowState']).to eq('graded')
          expect(json_result['submissions'][3]['workflowState']).to eq('unstarted')

          # only graded and published submissions' answers will be included in the stats
          expect(json_result['submissions'][0]['answers']).not_to be_nil
          expect(json_result['submissions'][1]['answers']).to be_nil
          expect(json_result['submissions'][2]['answers']).not_to be_nil
          expect(json_result['submissions'][3]['answers']).to be_nil

          # only graded and published submissions' answers will be included in the stats
          expect(json_result['submissions'][0]['courseUser']['role']).to eq('student')
          expect(json_result['submissions'][1]['courseUser']['role']).to eq('student')
          expect(json_result['submissions'][2]['courseUser']['role']).to eq('student')
          expect(json_result['submissions'][3]['courseUser']['role']).to eq('student')

          # only 1 ancestor will be returned (current) as no permission for ancestor assessment
          expect(json_result['ancestors'].count).to eq(1)
        end
      end

      context 'when the administrator get the main statistics data' do
        let(:administrator) { create(:administrator) }
        before { controller_sign_in(controller, administrator) }

        it 'returns OK with right information and 2 ancestors (both current and its predecassors)' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          # all the students data will be included here, including the non-existing submission one
          expect(json_result['submissions'].count).to eq(4)

          # showing the correct workflow state
          expect(json_result['submissions'][0]['workflowState']).to eq('published')
          expect(json_result['submissions'][1]['workflowState']).to eq('attempting')
          expect(json_result['submissions'][2]['workflowState']).to eq('graded')
          expect(json_result['submissions'][3]['workflowState']).to eq('unstarted')

          # only graded and published submissions' answers will be included in the stats
          expect(json_result['submissions'][0]['answers']).not_to be_nil
          expect(json_result['submissions'][1]['answers']).to be_nil
          expect(json_result['submissions'][2]['answers']).not_to be_nil
          expect(json_result['submissions'][3]['answers']).to be_nil

          # only graded and published submissions' answers will be included in the stats
          expect(json_result['submissions'][0]['courseUser']['role']).to eq('student')
          expect(json_result['submissions'][1]['courseUser']['role']).to eq('student')
          expect(json_result['submissions'][2]['courseUser']['role']).to eq('student')
          expect(json_result['submissions'][3]['courseUser']['role']).to eq('student')

          expect(json_result['ancestors'].count).to eq(2)
        end
      end
    end

    describe '#ancestor_statistics' do
      let(:original_students) { create_list(:course_student, 3, course: original_course) }
      let(:original_teaching_assistant) { create(:course_teaching_assistant, course: original_course) }

      let!(:original_submission1) do
        create(:submission, :published,
               assessment: original_assessment, course: original_course, creator: original_students[0].user)
      end
      let!(:original_submission2) do
        create(:submission, :attempting,
               assessment: original_assessment, course: original_course, creator: original_students[1].user)
      end
      let!(:original_submission_teaching_assistant) do
        create(:submission, :published,
               assessment: original_assessment, course: original_course, creator: original_teaching_assistant.user)
      end

      render_views
      subject do
        get :ancestor_statistics, as: :json, params: { course_id: original_course,
                                                       id: original_assessment }
      end

      context 'when the course manager of the original course wants to get statistics' do
        let(:course_manager) { create(:course_manager, course: original_course) }
        before { controller_sign_in(controller, course_manager.user) }

        it 'gives only the information regarding current destination as no authorization for parent course' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          # however, only the existing submissions will be shown
          expect(json_result['submissions'].count).to eq(2)
        end
      end

      context 'when the course manager of the current course wants to get statistics' do
        let(:course_manager) { create(:course_manager, course: course) }
        before { controller_sign_in(controller, course_manager.user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#live_feedback_history' do
      let(:question) do
        create(:course_assessment_question_programming, assessment: assessment).acting_as
      end
      let(:user) { create(:user) }

      let!(:course_student) { create(:course_student, course: course, user: user) }
      let!(:live_feedback) do
        create(:course_assessment_live_feedback, assessment: assessment,
                                                 question: question,
                                                 creator: course_student)
      end
      let!(:code) { create(:course_assessment_live_feedback_code, feedback: live_feedback) }
      let!(:comment) do
        create(:course_assessment_live_feedback_comment, code: code, line_number: 1,
                                                         comment: 'This is a test comment')
      end
      render_views
      subject do
        get :live_feedback_history, as: :json,
                                    params: {
                                      course_id: course,
                                      id: assessment.id,
                                      question_id: question.id,
                                      course_user_id: course_student.id
                                    }
      end

      context 'when the Normal User wants to get live feedback history' do
        before { controller_sign_in(controller, user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Manager wants to get live feedback history' do
        let(:course_manager) { create(:course_manager, course: course) }

        before { controller_sign_in(controller, course_manager.user) }

        it 'returns the live feedback history successfully' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          feedback_history = json_result['liveFeedbackHistory']
          question = json_result['question']

          expect(feedback_history).not_to be_empty
          expect(feedback_history.first).to have_key('files')

          file = feedback_history.first['files'].first
          expect(file).to have_key('filename')
          expect(file).to have_key('content')
          expect(file).to have_key('language')
          expect(file).to have_key('comments')

          comment = file['comments'].first
          expect(comment).to have_key('lineNumber')
          expect(comment).to have_key('comment')

          expect(question).not_to be_empty
          expect(question).to have_key('title')
          expect(question).to have_key('description')
        end
      end

      context 'when the Administrator wants to get live feedback history' do
        let(:administrator) { create(:administrator) }

        before { controller_sign_in(controller, administrator) }

        it 'returns the live feedback history successfully' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          feedback_history = json_result['liveFeedbackHistory']
          question = json_result['question']

          expect(feedback_history).not_to be_empty
          expect(feedback_history.first).to have_key('files')

          file = feedback_history.first['files'].first
          expect(file).to have_key('filename')
          expect(file).to have_key('content')
          expect(file).to have_key('language')
          expect(file).to have_key('comments')

          comment = file['comments'].first
          expect(comment).to have_key('lineNumber')
          expect(comment).to have_key('comment')

          expect(question).not_to be_empty
          expect(question).to have_key('title')
          expect(question).to have_key('description')
        end
      end
    end
  end
end
