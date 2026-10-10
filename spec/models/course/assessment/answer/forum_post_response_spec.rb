# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ForumPostResponse do
  it { is_expected.to act_as(Course::Assessment::Answer) }
  it 'has many post_packs' do
    expect(subject).to have_many(:post_packs).
      class_name(Course::Assessment::Answer::ForumPost.name).
      dependent(:destroy).
      with_foreign_key(:answer_id).
      inverse_of(:answer)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#compute_post_packs' do
      let(:forum) { create(:forum) }
      let(:topic) { create(:forum_topic, forum: forum) }
      let(:parent_post) { create(:course_discussion_post, topic: topic.acting_as) }
      let(:child_post) { create(:course_discussion_post, topic: topic.acting_as, parent: parent_post) }
      let(:answer) { create(:course_assessment_answer_forum_post_response) }
      let(:answer_with_parent) { create(:course_assessment_answer_forum_post_response) }
      let!(:post_pack) do
        create(:course_assessment_answer_forum_post, topic: topic.acting_as, post: parent_post, answer: answer.actable)
      end
      let!(:post_pack_with_parent) do
        create(:course_assessment_answer_forum_post, parent: parent_post, topic: topic.acting_as, post: child_post,
                                                     answer: answer_with_parent.actable)
      end

      it 'computes a single post pack correctly' do
        post_packs = answer.compute_post_packs
        expect(post_packs.count).to eq(1)
        expect(post_packs[0].id).to eq(post_pack.id)
        expect(post_packs[0].forum_topic_id).to eq(topic.id)
        expect(post_packs[0].post_id).to eq(parent_post.id)
        expect(post_packs[0].post_text).to eq(parent_post.text)
        expect(post_packs[0].post_creator_id).to eq(parent_post.creator.id)
        expect(post_packs[0].post_updated_at.utc).to be_within(1.second).of parent_post.updated_at.utc
        expect(post_packs[0].answer_id).to eq(answer.id)
        expect(post_packs[0].forum_id).to eq(forum.id)
        expect(post_packs[0].forum_name).to eq(forum.name)
        expect(post_packs[0].topic_title).to eq(topic.title)
        expect(post_packs[0].is_topic_deleted).to eq(false)
        expect(post_packs[0].post_creator).to eq(parent_post.creator)
        expect(post_packs[0].is_post_updated).to eq(false)
        expect(post_packs[0].is_post_deleted).to eq(false)
        expect(post_packs[0].parent_id).to eq(nil)
        expect(post_packs[0].parent_text).to eq(nil)
        expect(post_packs[0].parent_creator_id).to eq(nil)
        expect(post_packs[0].parent_updated_at).to eq(nil)
        expect(post_packs[0].parent_creator).to eq(nil)
        expect(post_packs[0].is_parent_updated).to eq(nil)
        expect(post_packs[0].is_parent_deleted).to eq(nil)
      end

      it 'computes a post pack with a parent post correctly' do
        post_packs = answer_with_parent.compute_post_packs
        expect(post_packs.count).to eq(1)
        expect(post_packs[0].post_id).to eq(child_post.id) # Just a simple sanity check for child post
        expect(post_packs[0].parent_id).to eq(parent_post.id)
        expect(post_packs[0].parent_text).to eq(parent_post.text)
        expect(post_packs[0].parent_creator_id).to eq(parent_post.creator.id)
        expect(post_packs[0].parent_updated_at.utc).to be_within(1.second).of parent_post.updated_at.utc
        expect(post_packs[0].parent_creator).to eq(parent_post.creator)
        expect(post_packs[0].is_parent_updated).to eq(false)
        expect(post_packs[0].is_parent_deleted).to eq(false)
      end

      it 'computes updated posts correctly' do
        parent_post.text = 'This post has been updated.'
        parent_post.save!
        wait_for_page # Realistic wait time + prevents race conditions
        post_packs = answer.compute_post_packs
        expect(post_packs[0].post_id).to eq(parent_post.id)
        expect(post_packs[0].post_updated_at.utc).not_to be_within(0.01.second).of parent_post.updated_at.utc
        expect(post_packs[0].is_post_updated).to eq(true)
        expect(post_packs[0].is_post_deleted).to eq(false)
      end

      it 'computes deleted posts correctly' do
        parent_post.destroy
        wait_for_page # Realistic wait time + prevents race conditions
        post_packs = answer.compute_post_packs
        expect(post_packs[0].post_id).to eq(parent_post.id)
        expect(post_packs[0].is_post_updated).to eq(nil)
        expect(post_packs[0].is_post_deleted).to eq(true)
      end

      it 'computes deleted topics correctly' do
        topic.reload.destroy
        wait_for_page # Realistic wait time + prevents race conditions
        post_packs = answer.compute_post_packs
        expect(post_packs[0].forum_topic_id).to eq(topic.id)
        expect(post_packs[0].post_id).to eq(parent_post.id)
        expect(post_packs[0].is_post_updated).to eq(nil)
        expect(post_packs[0].is_post_deleted).to eq(true)
        expect(post_packs[0].forum_id).to eq(nil)
        expect(post_packs[0].forum_name).to eq(nil)
        expect(post_packs[0].topic_title).to eq(nil)
        expect(post_packs[0].is_topic_deleted).to eq(true)
      end

      it 'computes updated parent posts correctly' do
        parent_post.text = 'This post has been updated.'
        parent_post.save!
        wait_for_page # Realistic wait time + prevents race conditions
        post_packs = answer_with_parent.compute_post_packs
        expect(post_packs[0].post_id).to eq(child_post.id) # Just a simple sanity check for child post
        expect(post_packs[0].parent_updated_at.utc).not_to be_within(0.01.second).of parent_post.updated_at.utc
        expect(post_packs[0].is_parent_updated).to eq(true)
        expect(post_packs[0].is_parent_deleted).to eq(false)
      end

      it 'computes deleted parent posts correctly' do
        parent_post.destroy
        wait_for_page # Realistic wait time + prevents race conditions
        post_packs = answer_with_parent.compute_post_packs
        expect(post_packs[0].post_id).to eq(child_post.id) # Just a simple sanity check for child post
        expect(post_packs[0].is_parent_updated).to eq(nil)
        expect(post_packs[0].is_parent_deleted).to eq(true)
      end
    end

    describe '#compare_answer' do
      let(:forum) { create(:forum) }
      let(:topic) { create(:forum_topic, forum: forum) }
      let(:parent_post1) { create(:course_discussion_post, topic: topic.acting_as) }
      let(:child_post1) { create(:course_discussion_post, topic: topic.acting_as, parent: parent_post1) }
      let(:parent_post2) { create(:course_discussion_post, topic: topic.acting_as) }
      let(:child_post2) { create(:course_discussion_post, topic: topic.acting_as, parent: parent_post2) }
      let(:answer1) { create(:course_assessment_answer_forum_post_response) }
      let(:answer1_different_text) do
        create(:course_assessment_answer_forum_post_response, answer_text: '<div>yyy</div>')
      end
      let(:answer1_no_post_pack) { create(:course_assessment_answer_forum_post_response) }
      let(:answer_with_parent1) { create(:course_assessment_answer_forum_post_response) }
      let(:answer2) { create(:course_assessment_answer_forum_post_response) }
      let(:answer_with_parent2) { create(:course_assessment_answer_forum_post_response) }
      let!(:post_pack1) do
        create(:course_assessment_answer_forum_post, topic: topic.acting_as, post: parent_post1,
                                                     answer: answer1.actable)
      end
      let!(:post_pack1_different_text) do
        create(:course_assessment_answer_forum_post, topic: topic.acting_as, post: parent_post1,
                                                     answer: answer1_different_text.actable)
      end
      let!(:post_pack_with_parent1) do
        create(:course_assessment_answer_forum_post, parent: parent_post1, topic: topic.acting_as, post: child_post1,
                                                     answer: answer_with_parent1.actable)
      end
      let!(:post_pack2) do
        create(:course_assessment_answer_forum_post, topic: topic.acting_as, post: parent_post2,
                                                     answer: answer2.actable)
      end
      let!(:post_pack_with_parent2) do
        create(:course_assessment_answer_forum_post, parent: parent_post2, topic: topic.acting_as, post: child_post2,
                                                     answer: answer_with_parent2.actable)
      end

      it 'compares if the answers are the same or not' do
        expect(answer1.compare_answer(answer1)).to be_truthy
        expect(answer1.compare_answer(answer1_different_text)).to be_falsey
        expect(answer1.compare_answer(answer1_no_post_pack)).to be_falsey
        expect(answer1.compare_answer(answer_with_parent1)).to be_falsey
        expect(answer1.compare_answer(answer2)).to be_falsey
        expect(answer1.compare_answer(answer_with_parent2)).to be_falsey
        expect(answer2.compare_answer(answer2)).to be_truthy
        expect(answer2.compare_answer(answer1)).to be_falsey
        expect(answer2.compare_answer(answer_with_parent1)).to be_falsey
        expect(answer2.compare_answer(answer_with_parent2)).to be_falsey
      end
    end

    describe '#grading_context_text' do
      it 'joins each selected post text and the text response, excluding parent context' do
        answer = described_class.new(answer_text: '<p>My reflection</p>')
        answer.post_packs.build(post_text: 'First body', parent_text: 'Parent body')
        answer.post_packs.build(post_text: 'Second body')

        text = answer.grading_context_text

        expect(text).to include('First body')
        expect(text).to include('Second body')
        expect(text).to include('My reflection')
        # Parent/thread context is intentionally excluded for now.
        expect(text).not_to include('Parent body')
      end

      it 'omits a blank text response' do
        answer = described_class.new(answer_text: '')
        answer.post_packs.build(post_text: 'Only body')

        expect(answer.grading_context_text).to eq('Only body')
      end
    end

    describe 'rubric grading' do
      let(:user) { create(:user) }
      let(:course) { create(:course, creator: user) }
      let(:assessment) { create(:assessment, :published, course: course) }
      let(:question) { create(:course_assessment_question_forum_post_response, assessment: assessment) }
      let(:rubric) { create(:course_rubric, course: course, questions: [question.acting_as]) }
      let(:submission) { create(:submission, :submitted, assessment: assessment, creator: user) }
      let(:answer) do
        create(:course_assessment_answer_forum_post_response, :submitted,
               question: question.acting_as, submission: submission).answer
      end
      let(:grading_mode) { 'rubric' }

      before { question.acting_as.update_columns(grading_mode: grading_mode, active_rubric_id: rubric.id) }

      describe 'manual grade-edit path (#assign_params)' do
        let!(:grading) { answer.specific.ensure_grading_evaluation! }
        let(:category) { rubric.categories.first }
        let(:selection) { grading.selections.find_by(category_id: category.id) }
        let(:criterion) { category.criterions.find { |c| c.grade == 2 } }

        it 'applies grade-selection edits to the grading evaluation when the answer saves' do
          answer.specific.assign_params(selections_attributes: [id: selection.id, criterion_id: criterion.id])
          answer.specific.save!

          expect(selection.reload.criterion_id).to eq(criterion.id)
        end

        context 'when the question is not rubric-graded' do
          let(:grading) do
            evaluation = Course::Rubric::AnswerEvaluation.create!(answer: answer, evaluation_type: :grading)
            rubric.categories.each { |category| evaluation.selections.create!(category_id: category.id) }
            evaluation
          end
          let(:grading_mode) { 'default' }

          it 'ignores grade-selection edits' do
            answer.specific.assign_params(selections_attributes: [id: selection.id, criterion_id: criterion.id])
            answer.specific.save!

            expect(selection.reload.criterion_id).to be_nil
          end
        end
      end

      describe '#ensure_grading_evaluation!' do
        it 'creates a blank grading evaluation with a selection per active-rubric category' do
          answer.specific.ensure_grading_evaluation!
          created = answer.reload.grading_rubric_evaluation

          expect(created.selections.map(&:category_id)).to match_array(rubric.categories.map(&:id))
          expect(created.selections.map(&:criterion_id)).to all(be_nil)
        end

        context 'when the question is not rubric-graded' do
          let(:grading_mode) { 'default' }

          it 'is a no-op' do
            expect { answer.specific.ensure_grading_evaluation! }.
              not_to change(Course::Rubric::AnswerEvaluation, :count)
          end
        end
      end
    end
  end
end
