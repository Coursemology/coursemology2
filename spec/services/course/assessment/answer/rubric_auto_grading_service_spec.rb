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
      end
      context 'when the question is rubric-based' do
        it 'always grades the answer as correct' do
          subject.grade(answer)
          expect(answer).to be_correct
          expect(answer.grade).to be_between(0, question.maximum_grade).inclusive
          expect(grading.result['messages']).to contain_exactly('success')
        end
      end
    end

    describe '#evaluate' do
      it 'evaluates the answer and creates an AI-generated draft post' do
        expect(subject).to receive(:create_ai_generated_draft_post)
        result = subject.evaluate(answer)
        expect(result).to be_between(0, question.maximum_grade).inclusive
        expect(answer.auto_grading.result).to eq({ 'messages' => ['success'] })
      end
    end

    describe '#evaluate_answer' do
      it 'instantiates LLM service and processes its response' do
        result = subject.send(:evaluate_answer, answer.actable)
        expect(result).to be_an(Array)
        expect(result.length).to eq(4) # [correct, grade, messages, feedback]
        expect(result[0]).to be true
        expect(result[1]).to be_between(0, question.maximum_grade).inclusive
        expect(result[2]).to contain_exactly('success')
        expect(result[3]).to include('Mock overall feedback')
      end
    end

    describe '#process_llm_grading_response' do
      context 'with valid LLM response' do
        let(:valid_response) do
          {
            'category_grades' => [
              {
                category_id: question.categories.first.id,
                criterion_id: question.categories.first.criterions.last.id,
                grade: question.categories.first.criterions.last.grade,
                explanation: '1st selection explanation'
              },
              {
                category_id: question.categories.second.id,
                criterion_id: question.categories.second.criterions.last.id,
                grade: question.categories.second.criterions.last.grade,
                explanation: '2nd selection explanation'
              }
            ],
            'overall_feedback' => 'overall feedback'
          }
        end
        it 'updates answer selections' do
          expect(answer.actable).to receive(:assign_params).with(hash_including(:selections_attributes))
          subject.send(:process_llm_grading_response, answer.actable, valid_response)
        end
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

    describe '#update_existing_draft_post' do
      let(:submission_question) do
        create(:course_assessment_submission_question, submission: submission, question: question.acting_as)
      end
      let(:existing_post) do
        create(:course_discussion_post, topic: submission_question.acting_as, text: 'draft post', is_ai_generated: true,
                                        workflow_state: 'draft')
      end
      it 'updates the existing post with new feedback' do
        expect(existing_post).to receive(:update!)
        expect(existing_post.topic).to receive(:mark_as_pending)
        subject.send(:update_existing_draft_post, existing_post, answer, 'new draft post')
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

    describe '#find_existing_ai_draft_post' do
      let(:submission_question) do
        create(:course_assessment_submission_question, submission: submission, question: question.acting_as)
      end

      context 'when there are no AI-generated draft posts' do
        it 'returns nil' do
          result = subject.send(:find_existing_ai_draft_post, submission_question)
          expect(result).to be_nil
        end
      end

      context 'when there are AI-generated draft posts' do
        let!(:older_ai_draft_post) do
          create(:course_discussion_post, topic: submission_question.acting_as, is_ai_generated: true,
                                          workflow_state: 'draft', created_at: 1.hour.ago)
        end
        let!(:newer_ai_draft_post) do
          create(:course_discussion_post, topic: submission_question.acting_as, is_ai_generated: true,
                                          workflow_state: 'draft', created_at: 30.minutes.ago)
        end
        let!(:ai_published_post) do
          create(:course_discussion_post, topic: submission_question.acting_as, is_ai_generated: true,
                                          workflow_state: 'published')
        end
        it 'returns the most recent AI-generated draft post' do
          result = subject.send(:find_existing_ai_draft_post, submission_question)
          expect(result).to eq(newer_ai_draft_post)
        end
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

      context 'when no existing AI-generated draft post exists' do
        it 'creates a new AI-generated draft post' do
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
      end

      context 'when an existing AI-generated draft post exists' do
        let!(:existing_post) do
          create(:course_discussion_post, topic: submission_question.acting_as, text: 'draft post',
                                          is_ai_generated: true, workflow_state: 'draft')
        end
        it 'updates the existing post instead of creating a new one' do
          expect do
            subject.send(:create_ai_generated_draft_post, answer, 'updated draft post')
          end.not_to(change { Course::Discussion::Post.count })
          existing_post.reload
          expect(existing_post.text).to eq('updated draft post')
          expect(existing_post.is_ai_generated).to be true
          expect(existing_post.workflow_state).to eq('draft')
          expect(existing_post.title).to eq(answer.submission.assessment.title)
          expect(existing_post.topic.pending_staff_reply).to be true
        end
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
