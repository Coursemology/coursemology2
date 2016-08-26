# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Topic, type: :model do
  it { is_expected.to be_actable }
  it { is_expected.to have_many(:posts).inverse_of(:topic).dependent(:destroy) }
  it { is_expected.to have_many(:subscriptions).inverse_of(:topic).dependent(:destroy) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:topic) { create(:forum_topic) }

    describe '#posts' do
      describe '#reload' do
        it 'removes its memoised result' do
          posts = topic.posts.ordered_topologically
          topic.posts.reload
          expect(topic.posts.ordered_topologically).not_to be(posts)
        end

        context 'before the posts are ordered' do
          it 'can be reloaded' do
            topic.posts.reload
          end
        end
      end

      describe '#ordered_topologically' do
        it 'memoises its result' do
          expect(topic.posts.ordered_topologically).to be(topic.posts.ordered_topologically)
        end
      end
    end

    describe '#subscribed_by?' do
      let(:another_user) { create(:user) }
      let!(:discussion_topic_subscription) do
        create(:course_discussion_topic_subscription, topic: topic.acting_as, user: user)
      end

      context 'when the user has subscribed to a topic' do
        it 'returns true' do
          expect(topic.subscribed_by?(user)).to eq(true)
        end
      end

      context 'when the user has not subscribed to a topic' do
        it 'returns false' do
          expect(topic.subscribed_by?(another_user)).to eq(false)
        end
      end
    end

    describe '#ensure_subscribed_by' do
      context 'when the user has subscribed to a topic' do
        let!(:discussion_topic_subscription) do
          create(:course_discussion_topic_subscription, topic: topic.acting_as, user: user)
        end

        it 'returns true' do
          expect(topic.ensure_subscribed_by(user)).to eq(true)
        end
      end

      context 'when the user is invalid' do
        it 'raises RecordInvalid exception' do
          expect { topic.ensure_subscribed_by(nil) }.to raise_error(ActiveRecord::RecordInvalid)
        end
      end

      context 'when record already exists' do
        let!(:discussion_topic_subscription) do
          create(:course_discussion_topic_subscription, topic: topic.acting_as, user: user)
        end

        before do
          allow(topic.acting_as).to receive(:subscribed_by?).with(user).and_return(false)
        end

        it 'returns true' do
          expect(topic.ensure_subscribed_by(user)).to eq(true)
        end
      end
    end

    describe '.globally_displayed' do
      let(:course) { create(:course) }
      let!(:annotation) do
        create(:course_assessment_answer_programming_file_annotation, :with_post, course: course).
          acting_as
      end
      let!(:comment) do
        create(:course_assessment_answer, :with_post, course: course).acting_as
      end
      let!(:comment_without_post) do
        create(:course_assessment_answer, course: course).acting_as
      end

      it 'only returns comments and annotations with posts' do
        expect(course.discussion_topics.globally_displayed).
          to contain_exactly(annotation, comment)
      end
    end

    describe '.ordered_by_updated_at' do
      let!(:topics) do
        create(:course_assessment_answer)
        create(:course_assessment_answer_programming_file_annotation)
      end

      it 'orders the topics by descending updated_at' do
        topics = Course::Discussion::Topic.ordered_by_updated_at.limit(10)
        expect(topics.each_cons(2).all? { |a, b| a.updated_at >= b.updated_at }).to be_truthy
      end
    end

    describe '.from_user' do
      let(:course) { create(:course) }
      let(:annotation_creator) { create(:user) }
      let(:comment_creator) { create(:user) }
      let!(:annotation) do
        create(:course_assessment_answer_programming_file_annotation,
               course: course, creator: annotation_creator).acting_as
      end
      let!(:comment) do
        create(:course_assessment_answer, course: course, creator: comment_creator).acting_as
      end
      subject { course.discussion_topics.from_user(user_id) }

      context 'when no user is given' do
        let(:user_id) { [] }

        it { is_expected.to be_empty }
      end

      context 'when the creator of annotation is given' do
        let(:user_id) { annotation_creator.id }

        it { is_expected.to contain_exactly(annotation) }
      end

      context 'when the creator of comment is given' do
        let(:user_id) { comment_creator.id }

        it { is_expected.to contain_exactly(comment) }
      end

      context 'when both creators are given' do
        let(:user_id) do
          [
            annotation_creator.id,
            comment_creator.id
          ]
        end

        it { is_expected.to contain_exactly(annotation, comment) }
      end
    end

    describe '.migrate!' do
      let(:from_topic) { create(:course_assessment_answer, :with_post, :pending).acting_as }
      let(:to_topic) { create(:course_assessment_answer).acting_as }
      let(:posts) { from_topic.posts }

      subject { Course::Discussion::Topic.migrate!(from: from_topic, to: to_topic) }

      it 'moves all the posts to the new topic' do
        subject

        expect(from_topic.posts.count).to be(0)
        expect(to_topic.posts).to contain_exactly(*posts)
      end

      it 'sets the pending status of the new topic' do
        subject

        expect(from_topic.pending_staff_reply).to be_falsey
        expect(to_topic.pending_staff_reply).to be_truthy
      end
    end
  end
end
