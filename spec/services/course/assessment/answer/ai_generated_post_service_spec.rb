# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::AiGeneratedPostService do
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

    describe '#build_draft_post' do
      let(:service) { described_class.new(answer, 'feedback') }
      let(:submission_question) do
        create(:course_assessment_submission_question, submission: submission, question: question.acting_as)
      end
      it 'builds a draft post with AI-generated feedback' do
        post = service.send(:build_draft_post, submission_question)
        expect(post.creator).to eq(User.system)
        expect(post.updater).to eq(User.system)
        expect(post.text).to eq('feedback')
        expect(post.is_ai_generated).to be true
        expect(post.workflow_state).to eq('draft')
        expect(post.title).to eq(answer.submission.assessment.title)
      end
    end

    describe '#save_draft_post' do
      let(:service) { described_class.new(answer, 'draft post') }
      let(:submission_question) do
        create(:course_assessment_submission_question, submission: submission, question: question.acting_as)
      end
      let(:post) { service.send(:build_draft_post, submission_question) }
      it 'saves the draft post and updates the submission question' do
        expect(submission_question.posts).to receive(:length).and_return(1)
        expect(post).to receive(:save!)
        expect(submission_question).to receive(:save!)
        expect(service).to receive(:create_topic_subscription).with(post.topic)
        expect(post.topic).to receive(:mark_as_pending)
        service.send(:save_draft_post, submission_question, post)
      end
    end

    describe '#update_existing_draft_post' do
      let(:service) { described_class.new(answer, 'new draft post') }
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
        service.send(:update_existing_draft_post, existing_post)
      end
    end

    describe '#create_topic_subscription' do
      let(:service) { described_class.new(answer, 'feedback') }
      let(:discussion_topic) { create(:course_discussion_topic) }
      it 'ensures the student and group managers are subscribed' do
        expect(discussion_topic).to receive(:ensure_subscribed_by).with(answer.submission.creator)
        answer_course_user = answer.submission.course_user
        answer_course_user.my_managers.each do |manager|
          expect(discussion_topic).to receive(:ensure_subscribed_by).with(manager.user)
        end
        service.send(:create_topic_subscription, discussion_topic)
      end
    end

    describe '#find_existing_ai_draft_post' do
      let(:service) { described_class.new(answer, 'feedback') }
      let(:submission_question) do
        create(:course_assessment_submission_question, submission: submission, question: question.acting_as)
      end

      context 'when there are no AI-generated draft posts' do
        it 'returns nil' do
          result = service.send(:find_existing_ai_draft_post, submission_question)
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
          result = service.send(:find_existing_ai_draft_post, submission_question)
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
        let(:service) { described_class.new(answer, 'draft post') }
        it 'creates a new AI-generated draft post' do
          expect do
            service.create_ai_generated_draft_post
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
        let(:service) { described_class.new(answer, 'updated draft post') }
        let!(:existing_post) do
          create(:course_discussion_post, topic: submission_question.acting_as, text: 'draft post',
                                          is_ai_generated: true, workflow_state: 'draft')
        end
        it 'updates the existing post instead of creating a new one' do
          expect do
            service.create_ai_generated_draft_post
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
        let(:service) { described_class.new(answer, 'feedback') }
        before do
          allow(answer.submission).to receive(:submission_questions).and_return(
            double(find_by: nil)
          )
        end
        it 'does not create a post' do
          expect do
            service.create_ai_generated_draft_post
          end.not_to(change { Course::Discussion::Post.count })
        end
      end
    end
  end
end
