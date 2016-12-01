require 'rails_helper'

RSpec.describe Course::Assessment::Submission::SubmissionsHelper do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#new_comments_post' do
      let(:topic) { build(:course_discussion_topic) }

      context 'when the topic has no posts' do
        it 'returns a new post' do
          expect(helper.new_comments_post(topic)).to be_a_new_record
        end
      end

      context 'when the topic has an unsaved post' do
        let!(:post) do
          build(:course_discussion_post, topic: topic).tap do |post|
            topic.posts << post
          end
        end

        it 'returns the unsaved post' do
          expect(helper.new_comments_post(topic)).to eq(post)
        end
      end

      context 'when the topic has all saved posts' do
        let!(:post) { create(:course_discussion_post, topic: topic) }
        it 'returns a new post' do
          expect(helper.new_comments_post(topic)).to be_a_new_record
        end
      end
    end

    describe '#max_step' do
      let(:assessment) { build(:assessment, :autograded, :published_with_mcq_question) }
      before { helper.instance_variable_set(:@assessment, assessment) }
      subject { helper.max_step }

      context 'when all questions have been answered' do
        before { allow(helper).to receive(:next_unanswered_question).and_return(nil) }

        it { is_expected.to eq(assessment.questions.length) }
      end
    end

    describe '#nav_class' do
      subject { helper.nav_class(step) }
      before do
        allow(helper).to receive(:max_step).and_return(5)
        allow(helper).to receive(:current_step).and_return(3)
      end

      context 'when step is greater than max_step' do
        let(:step) { 6 }
        it { is_expected.to eq('disabled') }
      end

      context 'when step is current_step' do
        let(:step) { 3 }
        it { is_expected.to eq('active') }
      end

      context 'when step less than current_step' do
        let(:step) { 2 }
        it { is_expected.to eq('completed') }
      end
    end
  end
end
