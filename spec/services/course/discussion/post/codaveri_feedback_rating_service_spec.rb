# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Post::CodaveriFeedbackRatingService do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:post) { create(:course_discussion_post) }
    let(:codaveri_feedback) do
      create(:course_discussion_post_codaveri_feedback, post: post, rating: rating, status: status)
    end
    let(:status) { :accepted }
    let(:rating) { 5 }

    subject { Course::Discussion::Post::CodaveriFeedbackRatingService.send_feedback(codaveri_feedback) }

    before do
      Excon.defaults[:mock] = true
    end

    describe '.send_feedback succeeds' do
      it 'sends rating to codaveri' do
        Excon.stub({ method: 'POST' }, Codaveri::FeedbackRatingApiStubs::FEEDBACK_RATING_SUCCESS)
        expect(subject).to eq('Rating successfully sent!')
        Excon.stubs.clear
      end
    end

    describe '.send_feedback fails' do
      it 'does not send rating to codaveri' do
        Excon.stub({ method: 'POST' }, Codaveri::FeedbackRatingApiStubs::FEEDBACK_RATING_FAILURE)
        expect { subject }.to raise_error(CodaveriError)
        Excon.stubs.clear
      end
    end
  end
end
