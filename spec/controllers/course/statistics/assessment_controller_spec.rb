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

    describe '#live_feedback_statistics' do
      render_views

      let(:question1) { create(:course_assessment_question_programming, assessment: assessment).acting_as }
      let!(:course_student) { students[1] }
      let!(:thread) do
        create(:live_feedback_thread, assessment: assessment, question: question1,
                                      submission_creator_id: course_student.user.id)
      end
      let!(:messages) do
        create_list(:live_feedback_message, 3, thread: thread)
      end

      subject do
        get :live_feedback_statistics, as: :json, params: { course_id: course, id: assessment.id }
      end

      context 'when the Normal User tries to get live feedback statistics' do
        let(:user) { create(:user) }
        before { controller_sign_in(controller, user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Student tries to get live feedback statistics' do
        let(:user) { create(:course_student, course: course).user }
        before { controller_sign_in(controller, user) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the Course Manager gets live feedback statistics' do
        let(:user) { create(:course_manager, course: course).user }
        before { controller_sign_in(controller, user) }

        it 'returns OK with the correct live feedback statistics' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          first_result = json_result.first

          # Check the general structure
          expect(first_result).to have_key('courseUser')
          expect(first_result['courseUser']).to have_key('id')
          expect(first_result['courseUser']).to have_key('name')
          expect(first_result['courseUser']).to have_key('role')
          expect(first_result['courseUser']).to have_key('isPhantom')

          expect(first_result).to have_key('workflowState')
          expect(first_result).to have_key('submissionId')
          expect(first_result).to have_key('groups')
          expect(first_result).to have_key('liveFeedbackData')
          expect(first_result).to have_key('questionIds')

          # Ensure that the feedback count is correct for the specific questions
          question_index = first_result['questionIds'].index(question1.id)
          if first_result['courseUser']['id'] == course_student.id
            expect(first_result['liveFeedbackData'][question_index]['messages_sent']).to eq(3)
          else
            expect(first_result['liveFeedbackData'][question_index]['messages_sent']).to eq(0)
          end
        end
      end

      context 'when the Administrator gets live feedback statistics' do
        let(:administrator) { create(:administrator) }
        before { controller_sign_in(controller, administrator) }

        it 'returns OK with the correct live feedback statistics' do
          expect(subject).to have_http_status(:success)
          json_result = JSON.parse(response.body)

          first_result = json_result.first

          # Check the general structure
          expect(first_result).to have_key('courseUser')
          expect(first_result['courseUser']).to have_key('id')
          expect(first_result['courseUser']).to have_key('name')
          expect(first_result['courseUser']).to have_key('role')
          expect(first_result['courseUser']).to have_key('isPhantom')

          expect(first_result).to have_key('workflowState')
          expect(first_result).to have_key('submissionId')
          expect(first_result).to have_key('groups')
          expect(first_result).to have_key('liveFeedbackData')
          expect(first_result).to have_key('questionIds')

          # Ensure that the feedback count is correct for the specific questions
          question_index = first_result['questionIds'].index(question1.id)
          if first_result['courseUser']['id'] == course_student.id
            expect(first_result['liveFeedbackData'][question_index]['messages_sent']).to eq(3)
          else
            expect(first_result['liveFeedbackData'][question_index]['messages_sent']).to eq(0)
          end
        end
      end
    end

    describe '#live_feedback_history' do
      let(:question) do
        create(:course_assessment_question_programming, assessment: assessment).acting_as
      end
      let(:user) { create(:user) }

      let!(:course_student) { students[1] }
      let!(:submission_question) { create(:submission_question, submission: submission2, question: question) }
      let!(:thread) do
        create(:live_feedback_thread, assessment: assessment, question: question,
                                      submission_question_id: submission_question.id,
                                      submission_creator_id: course_student.user.id)
      end
      let!(:messages) do
        create_list(:live_feedback_message, 3, thread: thread)
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

          message_history = json_result['messages']
          question = json_result['question']

          expect(message_history).not_to be_empty
          expect(message_history.first).to have_key('files')

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

          message_history = json_result['messages']
          question = json_result['question']

          expect(message_history).not_to be_empty
          expect(message_history.first).to have_key('files')

          expect(question).not_to be_empty
          expect(question).to have_key('title')
          expect(question).to have_key('description')
        end
      end
    end
  end
end
