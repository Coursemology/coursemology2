# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::RubricAutoGradingService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment, :published_with_rubric_question) }
    let(:question) { assessment.questions.first.specific }
    let(:submission) do
      create(:submission, :attempting, assessment: assessment)
    end
    let(:answer) do
      create(:course_assessment_answer_rubric_based_response, :submitted,
             question: question.acting_as, submission: submission).answer
    end
    let!(:grading) do
      create(:course_assessment_answer_auto_grading, answer: answer)
    end

    describe '#grade' do
      before do
        allow(answer.submission.assessment).to receive(:autograded?).and_return(true)
        allow_any_instance_of(Course::Assessment::Answer::RubricLlmService).
          to receive(:evaluate).and_return(
            'category_grades' => [
              {
                'category_id' => question.categories.first.id,
                'criterion_id' => question.categories.first.criterions.last.id,
                'grade' => question.categories.first.criterions.last.grade,
                'explanation' => '1st selection explanation'
              },
              {
                'category_id' => question.categories.second.id,
                'criterion_id' => question.categories.second.criterions.last.id,
                'grade' => question.categories.second.criterions.last.grade,
                'explanation' => '2nd selection explanation'
              }
            ],
            'overall_feedback' => 'overall feedback'
          )
      end
      context 'when the question is rubric-based' do
        it 'always grades the answer as correct' do
          subject.grade(answer)
          expect(answer.grade).to eq(question.categories.first.criterions.last.grade +
                                    question.categories.second.criterions.last.grade)
          expect(answer).to be_correct
          expect(grading.result['messages']).to contain_exactly('success')
        end
      end
    end

    describe '#evaluate' do
      it 'evaluates the answer and creates an AI-generated draft post' do
        allow(subject).to receive(:evaluate_answer).and_return([true, 10, ['success'], 'feedback'])
        expect(subject).to receive(:create_ai_generated_draft_post).with(answer, 'feedback')
        result = subject.evaluate(answer)
        expect(result).to eq(10)
        expect(answer.auto_grading.result).to eq({ 'messages' => ['success'] })
      end
    end

    describe '#evaluate_answer' do
      it 'instantiates LLM service and processes its response' do
        question = answer.question.actable
        llm_service_instance = instance_double(Course::Assessment::Answer::RubricLlmService)
        llm_response = { 'category_grades' => [], 'overall_feedback' => 'feedback' }
        expect(Course::Assessment::Answer::RubricLlmService).to receive(:new).and_return(llm_service_instance)
        expect(llm_service_instance).to receive(:evaluate).with(question, answer.actable).and_return(llm_response)
        expect(subject).to receive(:process_llm_grading_response).
          with(question, answer.actable, llm_response).and_return([true, 10, ['success'], 'feedback'])
        result = subject.send(:evaluate_answer, answer.actable)
        expect(result).to eq([true, 10, ['success'], 'feedback'])
      end
    end

    describe '#process_llm_grading_response' do
      context 'with valid LLM response' do
        let(:valid_response) do
          {
            'category_grades' => [
              {
                'category_id' => question.categories.first.id,
                'criterion_id' => question.categories.first.criterions.last.id,
                'grade' => question.categories.first.criterions.last.grade,
                'explanation' => '1st selection explanation'
              },
              {
                'category_id' => question.categories.second.id,
                'criterion_id' => question.categories.second.criterions.last.id,
                'grade' => question.categories.second.criterions.last.grade,
                'explanation' => '2nd selection explanation'
              }
            ],
            'overall_feedback' => 'overall feedback'
          }
        end
        it 'processes category grades' do
          result = subject.send(:process_llm_grading_response, question, answer.actable, valid_response)
          expect(result[0]).to be true
          expect(result[1]).to eq(question.categories.first.criterions.last.grade +
                                 question.categories.second.criterions.last.grade)
          expect(result[2]).to contain_exactly('success')
          expect(result[3]).to eq('overall feedback')
        end
        it 'updates answer selections' do
          expect(answer.actable).to receive(:assign_params).with(hash_including(:selections_attributes))
          subject.send(:process_llm_grading_response, question, answer.actable, valid_response)
        end
      end
    end

    describe '#process_category_grades' do
      let(:category) { question.categories.first }
      let(:criterion) { category.criterions.first }
      let(:llm_response) do
        {
          'category_grades' => [
            {
              'category_id' => category.id,
              'criterion_id' => criterion.id,
              'explanation' => 'selection explanation'
            }
          ]
        }
      end
      it 'processes category grades correctly' do
        result = subject.send(:process_category_grades, question, llm_response)
        expect(result.size).to eq(1)
        expect(result.first[:category_id]).to eq(category.id)
        expect(result.first[:criterion_id]).to eq(criterion.id)
        expect(result.first[:grade]).to eq(criterion.grade)
        expect(result.first[:explanation]).to eq('selection explanation')
      end
      it 'ignores non-existent categories' do
        llm_response['category_grades'] << { 'category_id' => -1, 'criterion_id' => -1 }
        llm_response['category_grades'] << { 'category_id' => category.id, 'criterion_id' => -1 }
        result = subject.send(:process_category_grades, question, llm_response)
        expect(result.size).to eq(1)
        expect(result.first[:category_id]).to eq(category.id)
      end
    end

    describe '#update_answer_selections' do
      let(:category_grades) do
        [
          {
            category_id: question.categories.first.id,
            criterion_id: question.categories.first.criterions.first.id,
            grade: question.categories.first.criterions.first.grade,
            explanation: 'selection explanation'
          }
        ]
      end
      context 'when answer selections do not exist' do
        before do
          allow(answer.actable).to receive(:selections).and_return([])
        end
        it 'creates category grade instances' do
          expect(answer.actable).to receive(:create_category_grade_instances)
          expect(answer.actable).to receive(:reload)
          subject.send(:update_answer_selections, answer.actable, category_grades)
        end
      end
      context 'when answer selections exist' do
        let(:selection) do
          build_stubbed(:course_assessment_answer_rubric_based_response_selection,
                        category_id: question.categories.first.id)
        end
        before do
          allow(answer.actable).to receive(:selections).and_return([selection])
        end
        it 'assigns parameters to existing selections' do
          expect(answer.actable).to receive(:assign_params).with(
            hash_including(selections_attributes: array_including(
              hash_including(
                id: selection.id,
                criterion_id: question.categories.first.criterions.first.id,
                grade: question.categories.first.criterions.first.grade,
                explanation: 'selection explanation'
              )
            ))
          )
          subject.send(:update_answer_selections, answer.actable, category_grades)
        end
      end
    end

    describe '#update_answer_grade' do
      let(:category_grades) do
        [
          {
            category_id: question.categories.first.id,
            criterion_id: question.categories.first.criterions.first.id,
            grade: question.categories.first.criterions.last.grade,
            explanation: '1st selection explanation'
          },
          {
            category_id: question.categories.second.id,
            criterion_id: question.categories.second.criterions.first.id,
            grade: question.categories.second.criterions.last.grade,
            explanation: '2nd selection explanation'
          }
        ]
      end
      it 'updates the answer grade based on category grades' do
        subject.send(:update_answer_selections, answer.actable, category_grades)
        total_grade = subject.send(:update_answer_grade, answer.actable, category_grades)
        expect(total_grade).to eq(
          question.categories.first.criterions.last.grade +
          question.categories.second.criterions.last.grade
        )
        expect(answer.actable.grade).to eq(total_grade)
      end
    end

    describe '#build_draft_post' do
      let(:submission_question) do
        create(:course_assessment_submission_question, submission: submission, question: question.acting_as)
      end
      it 'builds a draft post with AI-generated feedback' do
        post = subject.send(:build_draft_post, submission_question, answer, 'feedback')
        expect(post.creator).to eq(User.system)
        expect(post.updater).to eq(User.system)
        expect(post.text).to eq('feedback')
        expect(post.is_ai_generated).to be true
        expect(post.workflow_state).to eq('draft')
        expect(post.title).to eq(answer.submission.assessment.title)
      end
    end

    describe '#save_draft_post' do
      let(:submission_question) do
        create(:course_assessment_submission_question, submission: submission, question: question.acting_as)
      end
      let(:post) { subject.send(:build_draft_post, submission_question, answer, 'draft post') }
      it 'saves the draft post and updates the submission question' do
        expect(submission_question.posts).to receive(:length).and_return(1)
        expect(post).to receive(:save!)
        expect(submission_question).to receive(:save!)
        expect(subject).to receive(:create_topic_subscription).with(post.topic, answer)
        expect(post.topic).to receive(:mark_as_pending)
        subject.send(:save_draft_post, submission_question, answer, post)
      end
    end

    describe '#create_topic_subscription' do
      let(:discussion_topic) { create(:course_discussion_topic) }
      it 'ensures the student and group managers are subscribed' do
        expect(discussion_topic).to receive(:ensure_subscribed_by).with(answer.submission.creator)
        answer_course_user = answer.submission.course_user
        answer_course_user.my_managers.each do |manager|
          expect(discussion_topic).to receive(:ensure_subscribed_by).with(manager.user)
        end
        subject.send(:create_topic_subscription, discussion_topic, answer)
      end
    end

    describe '#create_ai_generated_draft_post' do
      let(:submission_question) do
        create(:course_assessment_submission_question, submission: submission, question: question.acting_as)
      end
      before do
        allow(answer.submission).to receive(:submission_questions).and_return(
          double(find_by: submission_question)
        )
      end
      it 'creates a AI-gernerated draft post' do
        expect do
          subject.send(:create_ai_generated_draft_post, answer, 'draft post')
        end.to change { Course::Discussion::Post.count }.by(1)
        post = Course::Discussion::Post.last
        expect(post.text).to eq('draft post')
        expect(post.is_ai_generated).to be true
        expect(post.workflow_state).to eq('draft')
        expect(post.title).to eq(answer.submission.assessment.title)
        expect(post.topic.pending_staff_reply).to be true
      end
      context 'when no submission question exists' do
        before do
          allow(answer.submission).to receive(:submission_questions).and_return(
            double(find_by: nil)
          )
        end
        it 'does not create a post' do
          expect do
            subject.send(:create_ai_generated_draft_post, answer, 'draft post')
          end.not_to(change { Course::Discussion::Post.count })
        end
      end
    end
  end
end
