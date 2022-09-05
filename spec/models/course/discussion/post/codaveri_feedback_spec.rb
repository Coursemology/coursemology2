# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Post::CodaveriFeedback do
  it { is_expected.to belong_to(:post).inverse_of(:codaveri_feedback) }
  it { is_expected.to validate_presence_of(:codaveri_feedback_id) }
  it { is_expected.to validate_presence_of(:original_feedback) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:post) { create(:course_discussion_post) }
    let(:codaveri_feedback) do
      create(:course_discussion_post_codaveri_feedback, post: post, rating: rating, status: status)
    end
    let(:status) { :accepted }
    let(:rating) { 5 }
    subject do
      codaveri_feedback.send(:send_rating_to_codaveri)
    end

    describe '.send_rating_to_codaveri succeeds' do
      before do
        Course::Discussion::Post::CodaveriFeedback.class_eval do
          prepend Course::Discussion::Post::StubbedCodaveriFeedback
        end
      end

      it 'sends rating to codaveri' do
        expect(subject).to eq('Rating successfully sent!')
      end

      context 'when the status of the feedback is pending_review' do
        let(:status) { :pending_review }

        it 'does not rating to codaveri' do
          expect(subject).to eq(false)
        end
      end

      context 'when the rating of the feedback is empty' do
        let(:rating) { nil }

        it 'does not rating to codaveri' do
          expect(subject).to eq(false)
        end
      end
    end

    describe '.send_rating_to_codaveri fails' do
      before do
        Course::Discussion::Post::CodaveriFeedback.class_eval do
          prepend Course::Discussion::Post::StubbedCodaveriFeedbackFailed
        end
      end

      it 'does not send rating to codaveri' do
        expect(subject).to eq(false)
      end
    end
  end
end
